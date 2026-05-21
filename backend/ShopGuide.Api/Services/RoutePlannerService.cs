using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Data;
using ShopGuide.Api.Models;
using ShopGuide.Api.DTOs;

namespace ShopGuide.Api.Services
{
    public class RoutePlannerService
    {
        private readonly ApplicationDbContext _context;

        public RoutePlannerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task PlanRouteAsync(int shoppingListId)
        {
            var list = await _context.ShoppingLists
                .FirstOrDefaultAsync(x => x.Id == shoppingListId);

            if (list == null)
                throw new InvalidOperationException($"ShoppingList {shoppingListId} not found.");

            var items = await _context.ShoppingListItems
                .Where(i => i.ShoppingListId == shoppingListId)
                .ToListAsync();

            if (items.Count == 0)
                return;

            var nodes = await _context.StoreMapNodes
                .Where(n => n.StoreId == list.StoreId)
                .ToListAsync();

            if (nodes.Count == 0)
                throw new InvalidOperationException($"Store {list.StoreId} has no map nodes.");

            var entranceNode = nodes.FirstOrDefault(n => n.NodeType == "Entrance") ?? nodes.First();

            var edges = await _context.StoreMapEdges
                .Where(e => e.StoreId == list.StoreId)
                .ToListAsync();

            var graph = BuildGraph(edges);

            var itemsWithNode = items.Where(i => i.NodeId.HasValue).ToList();
            var itemsWithoutNode = items.Where(i => !i.NodeId.HasValue).ToList();

            var targetNodes = itemsWithNode
                .Select(i => i.NodeId!.Value)
                .Distinct()
                .ToHashSet();

            if (targetNodes.Count == 0)
            {
                int idx = 1;

                foreach (var item in itemsWithoutNode.OrderBy(i => i.ProductId))
                    item.OrderIndex = idx++;

                await _context.SaveChangesAsync();
                return;
            }

            var routeNodes = BuildZoneBasedRoute(
                graph,
                allNodes: nodes,
                startNodeId: entranceNode.Id,
                targets: targetNodes
            );

            int order = 1;

            foreach (var nodeId in routeNodes)
            {
                var itemsAtNode = itemsWithNode
                    .Where(i => i.NodeId == nodeId)
                    .OrderBy(i => i.ProductId)
                    .ToList();

                foreach (var item in itemsAtNode)
                    item.OrderIndex = order++;
            }

            foreach (var item in itemsWithoutNode.OrderBy(i => i.ProductId))
                item.OrderIndex = order++;

            await _context.SaveChangesAsync();
        }

        public async Task<List<int>> BuildRoutePathAsync(int shoppingListId)
        {
            var list = await _context.ShoppingLists
                .FirstOrDefaultAsync(x => x.Id == shoppingListId);

            if (list == null)
                throw new InvalidOperationException($"ShoppingList {shoppingListId} not found.");

            var nodes = await _context.StoreMapNodes
                .Where(n => n.StoreId == list.StoreId)
                .ToListAsync();

            if (nodes.Count == 0)
                throw new InvalidOperationException($"Store {list.StoreId} has no map nodes.");

            var entranceNode = nodes.FirstOrDefault(n => n.NodeType == "Entrance") ?? nodes.First();
            var checkoutNode = nodes.FirstOrDefault(n => n.NodeType == "Checkout");

            var edges = await _context.StoreMapEdges
                .Where(e => e.StoreId == list.StoreId)
                .ToListAsync();

            var graph = BuildGraph(edges);

            var orderedTargetNodeIds = await _context.ShoppingListItems
                .Where(i => i.ShoppingListId == shoppingListId && i.NodeId.HasValue)
                .OrderBy(i => i.OrderIndex)
                .Select(i => i.NodeId!.Value)
                .Distinct()
                .ToListAsync();

            var fullPath = new List<int>();
            var currentNodeId = entranceNode.Id;

            foreach (var targetNodeId in orderedTargetNodeIds)
            {
                var pathPart = DijkstraPath(graph, currentNodeId, targetNodeId);

                AddPathPart(fullPath, pathPart);

                currentNodeId = targetNodeId;
            }

            if (checkoutNode != null)
            {
                var pathToCheckout = DijkstraPath(graph, currentNodeId, checkoutNode.Id);
                AddPathPart(fullPath, pathToCheckout);
            }

            return fullPath;
        }

        private static void AddPathPart(List<int> fullPath, List<int> pathPart)
        {
            if (pathPart.Count == 0)
                return;

            if (fullPath.Count == 0)
            {
                fullPath.AddRange(pathPart);
                return;
            }

            fullPath.AddRange(pathPart.Skip(1));
        }

        private static Dictionary<int, List<(int to, double cost)>> BuildGraph(List<StoreMapEdge> edges)
        {
            var graph = new Dictionary<int, List<(int to, double cost)>>();

            foreach (var edge in edges)
            {
                if (!graph.ContainsKey(edge.FromNodeId))
                    graph[edge.FromNodeId] = new List<(int, double)>();

                graph[edge.FromNodeId].Add((edge.ToNodeId, edge.Distance));
            }

            return graph;
        }

        private static List<int> BuildGreedyRoute(
            Dictionary<int, List<(int to, double cost)>> graph,
            int startNodeId,
            HashSet<int> targets)
        {
            var remaining = new HashSet<int>(targets);
            var route = new List<int>();
            var current = startNodeId;

            while (remaining.Count > 0)
            {
                var bestNode = -1;
                var bestDistance = double.PositiveInfinity;

                foreach (var candidate in remaining)
                {
                    var distance = DijkstraDistance(graph, current, candidate);

                    if (distance < bestDistance)
                    {
                        bestDistance = distance;
                        bestNode = candidate;
                    }
                }

                if (bestNode == -1 || double.IsPositiveInfinity(bestDistance))
                    bestNode = remaining.First();

                route.Add(bestNode);
                remaining.Remove(bestNode);
                current = bestNode;
            }

            return route;
        }

        private static double DijkstraDistance(
            Dictionary<int, List<(int to, double cost)>> graph,
            int start,
            int goal)
        {
            if (start == goal)
                return 0;

            var dist = new Dictionary<int, double>();
            var pq = new PriorityQueue<int, double>();

            dist[start] = 0;
            pq.Enqueue(start, 0);

            while (pq.Count > 0)
            {
                pq.TryDequeue(out var node, out var d);

                if (dist.TryGetValue(node, out var known) && d > known)
                    continue;

                if (node == goal)
                    return d;

                if (!graph.TryGetValue(node, out var neighbors))
                    continue;

                foreach (var (to, cost) in neighbors)
                {
                    var newDistance = d + cost;

                    if (!dist.TryGetValue(to, out var currentDistance) || newDistance < currentDistance)
                    {
                        dist[to] = newDistance;
                        pq.Enqueue(to, newDistance);
                    }
                }
            }

            return double.PositiveInfinity;
        }

        private static int GetZone(StoreMapNode node)
{
    if (node.X < 300 && node.Y >= 300)
        return 1;

    if (node.X < 300 && node.Y < 300)
        return 2;

    if (node.X >= 300 && node.Y < 300)
        return 3;

    return 4;
}

private static List<int> BuildZoneBasedRoute(
    Dictionary<int, List<(int to, double cost)>> graph,
    List<StoreMapNode> allNodes,
    int startNodeId,
    HashSet<int> targets)
{
    var route = new List<int>();
    var currentNodeId = startNodeId;

    var targetNodes = allNodes
        .Where(n => targets.Contains(n.Id))
        .ToList();

    var groupedByZone = targetNodes
        .GroupBy(GetZone)
        .OrderBy(g => g.Key);

    foreach (var zoneGroup in groupedByZone)
    {
        var remainingInZone = zoneGroup
            .Select(n => n.Id)
            .ToHashSet();

        while (remainingInZone.Count > 0)
        {
            int bestNode = -1;
            double bestDistance = double.PositiveInfinity;

            foreach (var candidate in remainingInZone)
            {
                var distance = DijkstraDistance(graph, currentNodeId, candidate);

                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    bestNode = candidate;
                }
            }

            if (bestNode == -1 || double.IsPositiveInfinity(bestDistance))
                bestNode = remainingInZone.First();

            route.Add(bestNode);
            remainingInZone.Remove(bestNode);
            currentNodeId = bestNode;
        }
    }

    return route;
}

        private static List<int> DijkstraPath(
            Dictionary<int, List<(int to, double cost)>> graph,
            int start,
            int goal)
        {
            if (start == goal)
                return new List<int> { start };

            var dist = new Dictionary<int, double>();
            var previous = new Dictionary<int, int>();
            var pq = new PriorityQueue<int, double>();

            dist[start] = 0;
            pq.Enqueue(start, 0);

            while (pq.Count > 0)
            {
                pq.TryDequeue(out var node, out var d);

                if (dist.TryGetValue(node, out var known) && d > known)
                    continue;

                if (node == goal)
                    break;

                if (!graph.TryGetValue(node, out var neighbors))
                    continue;

                foreach (var (to, cost) in neighbors)
                {
                    var newDistance = d + cost;

                    if (!dist.TryGetValue(to, out var currentDistance) || newDistance < currentDistance)
                    {
                        dist[to] = newDistance;
                        previous[to] = node;
                        pq.Enqueue(to, newDistance);
                    }
                }
            }

            if (!dist.ContainsKey(goal))
                return new List<int>();

            var path = new List<int>();
            var current = goal;

            path.Add(current);

            while (current != start)
            {
                if (!previous.TryGetValue(current, out var prev))
                    return new List<int>();

                current = prev;
                path.Add(current);
            }

            path.Reverse();
            return path;
        }

        public async Task<RoutePlanDto> BuildRoutePlanAsync(int shoppingListId)
{
    var fullPath = await BuildRoutePathAsync(shoppingListId);
    var segments = await BuildRouteSegmentsAsync(shoppingListId);

    return new RoutePlanDto
    {
        ShoppingListId = shoppingListId,
        FullPathNodeIds = fullPath,
        Segments = segments
    };
}

public async Task<List<RouteSegmentDto>> BuildRouteSegmentsAsync(int shoppingListId)
{
    var list = await _context.ShoppingLists
        .FirstOrDefaultAsync(x => x.Id == shoppingListId);

    if (list == null)
        throw new InvalidOperationException($"ShoppingList {shoppingListId} not found.");

    var nodes = await _context.StoreMapNodes
        .Where(n => n.StoreId == list.StoreId)
        .ToListAsync();

    var edges = await _context.StoreMapEdges
        .Where(e => e.StoreId == list.StoreId)
        .ToListAsync();

    var graph = BuildGraph(edges);

    var entranceNode = nodes.FirstOrDefault(n => n.NodeType == "Entrance") ?? nodes.First();
    var checkoutNode = nodes.FirstOrDefault(n => n.NodeType == "Checkout");

    var items = await _context.ShoppingListItems
    .Include(i => i.Product)
    .Where(i => i.ShoppingListId == shoppingListId && i.NodeId.HasValue)
    .OrderBy(i => i.OrderIndex)
    .ToListAsync();

    var segments = new List<RouteSegmentDto>();

    var currentNodeId = entranceNode.Id;
    var step = 1;

    foreach (var item in items)
    {
        var targetNodeId = item.NodeId!.Value;
        var path = DijkstraPath(graph, currentNodeId, targetNodeId);

        segments.Add(new RouteSegmentDto
        {
            StepNumber = step,
            Title = $"Gå till {item.Product.Name}",
            ProductName = item.Product.Name,
            ProductId = item.ProductId,
            FromNodeId = currentNodeId,
            ToNodeId = targetNodeId,
            PathNodeIds = path
        });

        currentNodeId = targetNodeId;
        step++;
    }

    if (checkoutNode != null)
    {
        var checkoutPath = DijkstraPath(graph, currentNodeId, checkoutNode.Id);

        segments.Add(new RouteSegmentDto
        {
            StepNumber = step,
            Title = "Gå till kassan",
            ProductName = null,
            ProductId = null,
            FromNodeId = currentNodeId,
            ToNodeId = checkoutNode.Id,
            PathNodeIds = checkoutPath
        });
    }

    return segments;
}
    }
}
