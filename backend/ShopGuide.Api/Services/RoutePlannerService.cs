using System.Xml;
using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Data;
using ShopGuide.Api.Models;

namespace ShopGuide.Api.Services
{
    public class RoutePlannerService
    {
        private readonly ApplicationDbContext _context;

        public RoutePlannerService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 1) Hitta Entré-nod (NodeType == "Entrance")
        /// 2) Samla alla unika produkt-noder från listans items
        /// 3) Använda Dijkstra för avstånd mellan noder
        /// 4) Greedy: gå alltid till närmaste nod
        /// 5) Sätta OrderIndex på ShoppingListItems
        /// <summary>
        public async Task PlaneRouteAsync(int shoppingListId)
        {
            var list = await _context.ShoppingLists.FirstOrDefaultAsync(x => x.Id == shoppingListId);
            if (list == null)
                throw new InvalidOperationException($"ShoppingList {shoppingListId} not found.");

            //Hämta items (spårade items-objekt) så vi kan uppdatera OrderIndex
            var items = await _context.ShoppingListItems
                .Where(i => i.ShoppingListId == shoppingListId)
                .ToListAsync();

            if (items.Count == 0)
            return;

            //Hämta butikens noder (för att hitta entre/kassa)
            var nodes = await _context.StoreMapNodes
            .Where(n => n.StoreId == list.StoreId)
            .ToListAsync();

            if (nodes.Count == 0)
                throw new InvalidOperationException($"Store {list.StoreId} has no mape nodes");

            var entranceNode = nodes.FirstOrDefault(n => n.NodeType == "Entrance") ?? nodes.First();
            var checkoutNode = nodes.FirstOrDefault(n => n.NodeType == "Checkout");

            //Skapa adjency list från edges
            var edges = await _context.StoreMapEdges
                .Where(e => e.StoreId == list.StoreId)
                .ToListAsync();

            var graph = BuildGraph(edges);

            //Ta bort items som faktiskt har en NodeId
            var itemsWithNode = items.Where(i => i.NodeId.HasValue).ToList();
            var itemsWithoutNode = items.Where(i => !i.NodeId.HasValue).ToList();

            //Unika noder som vi behöver besöka
            var targetNodes = itemsWithNode
                .Select(i => i.NodeId!.Value)
                .Distinct()
                .ToHashSet();

            if (targetNodes.Count == 0)
            {
                //Ingen har plats -> lägg bara sist
                int idx = 1;
                foreach(var i in itemsWithNode)
                    i.OrderIndex = idx++;
                return;
            }

            //Greedy-ordning mellan noder
            var routeNodes = BuildGreedyRoute(
                graph,
                startNodeId: entranceNode.Id,
                targets: targetNodes
            );

            //Lägg till kassa sist om den finns och om den inte redan är med
            if (checkoutNode != null && !routeNodes.Contains(checkoutNode.Id))
                routeNodes.Add(checkoutNode.Id);

            // Sätt OrderIndex på items baserat på nodordningen
            // Alla items i samma nod får samma "block" (men olika OrderIndex i följd)
            int order = 1;


            foreach (var nodeId in routeNodes)
            {
                var itemsAtNode = itemsWithNode
                    .Where(i => i.NodeId == nodeId)
                    .OrderBy(i => i.ProductId)
                    .ToList();

                foreach (var it in itemsAtNode)
                    it.OrderIndex = order++;        
            }

            //items utan nod hamnar sist
            foreach (var it in itemsWithoutNode.OrderBy(i => i.ProductId))
                it.OrderIndex = order++;

            await _context.SaveChangesAsync();
        }


        private static Dictionary<int, List<(int to, double cost)>> BuildGraph(List<StoreMapEdge> edges)
        {
            var graph = new Dictionary<int, List<(int to, double cost)>>();
            foreach (var e in edges)
            {
                if (!graph.ContainsKey(e.FromNodeId))
                    graph[e.FromNodeId] = new List<(int, double)>();

                graph[e.FromNodeId].Add((e.ToNodeId, e.Distance));
            }
            return graph;
        }

        private List<int> BuildGreedyRoute(
            Dictionary<int, List<(int to, double cost)>> graph,
            int startNodeId,
            HashSet<int> targets)
        {
            var remaining = new HashSet<int>(targets);
            var route = new List<int>();

            int current = startNodeId;

            while(remaining.Count > 0)
            {
                int bestNode = -1;
                double bestDistance = double.PositiveInfinity;

                foreach (var candidate in remaining)
                {
                    var dist = DijkstraDistance(graph, current, candidate);

                    if (dist < bestDistance)
                    {
                        bestDistance = dist;
                        bestNode = candidate;
                    }
                }

                //Om grafen är trasig och ingen väg finns -> ta en "fallback"
                if (bestNode == -1 || double.IsPositiveInfinity(bestDistance))
                {
                    bestNode = remaining.First();
                }

                route.Add(bestNode);
                remaining.Remove(bestNode);
                current = bestNode;
            }
            return route;
        }

        //Returnerar korstaste avståndet mellan två noder med Dijkstra.
        private static double DijkstraDistance(
            Dictionary<int, List<(int to, double cost)>> graph,
            int start,
            int goal)
        {
            if (start == goal) return 0;

            var dist = new Dictionary<int, double>();
            var pq = new PriorityQueue<int, double>();

            dist[start] = 0;
            pq.Enqueue(start, 0);

            while(pq.Count > 0)
            {
                pq.TryDequeue(out int node, out double d);

                //Om vi redan hittat en bättre väg, hoppa
                if(dist.TryGetValue(node, out var know) && d > know)
                    continue;

                if(node == goal)
                    return d;

                if(!graph.TryGetValue(node, out var neighbors))
                    continue;

                foreach (var(to, cost) in neighbors)
                {
                    var nd = d + cost;

                    if(!dist.TryGetValue(to, out var cur) || nd < cur)
                    {
                        dist[to] = nd;
                        pq.Enqueue(to, nd);
                    }
                }
            }
            return double.PositiveInfinity; //ingen väg
        }
    }
}