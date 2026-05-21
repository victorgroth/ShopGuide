using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Models;
using ShopGuide.Api.Data.SeedFiles;
namespace ShopGuide.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Så att vi inte dubblerar data
            if (await context.Stores.AnyAsync())
                return;

            // =========================
            // STORES
            // =========================

            var groceryStore = new Store
            {
                Name = "ICA Maxi Mölndal",
                Address = "Mölndalsvägen 123",
                City = "Mölndal",
                StoreType = "Grocery"
            };

            var hardwareStore = new Store
            {
                Name = "ByggHallen Sisjön",
                Address = "Sisjövägen 45",
                City = "Göteborg",
                StoreType = "Hardware"
            };

            context.Stores.AddRange(groceryStore, hardwareStore);
            await context.SaveChangesAsync();

            // =========================
            // LOAD ICA MAP JSON
            // =========================

            var jsonPath = Path.Combine(
                AppContext.BaseDirectory,
                "Data",
                "SeedFiles",
                "ica-map.json"
            );

            var json = await File.ReadAllTextAsync(jsonPath);

           var mapData = JsonSerializer.Deserialize<SeedMapData>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            )!;
            
            if (mapData == null)
            {
                throw new Exception("Could not load ica-map.json");
            }

            // =========================
            // CREATE ICA NODES
            // =========================

            var nodeLookup = new Dictionary<string, StoreMapNode>();

            foreach (var node in mapData.Nodes)
            {
                var storeNode = new StoreMapNode
                {
                    StoreId = groceryStore.Id,
                    Label = node.Label,
                    NodeType = node.NodeType,
                    X = node.X,
                    Y = node.Y
                };

                context.StoreMapNodes.Add(storeNode);

                nodeLookup[node.Key] = storeNode;
            }

            await context.SaveChangesAsync();

            // =========================
            // CREATE ICA EDGES
            // =========================

            foreach (var edge in mapData.Edges)
            {
                var fromNode = nodeLookup[edge.From];
                var toNode = nodeLookup[edge.To];

                context.StoreMapEdges.Add(new StoreMapEdge
                {
                    StoreId = groceryStore.Id,
                    FromNodeId = fromNode.Id,
                    ToNodeId = toNode.Id,
                    Distance = edge.Distance
                });

                // tvåvägsedge
                context.StoreMapEdges.Add(new StoreMapEdge
                {
                    StoreId = groceryStore.Id,
                    FromNodeId = toNode.Id,
                    ToNodeId = fromNode.Id,
                    Distance = edge.Distance
                });
            }

            await context.SaveChangesAsync();

            // =========================
// LOAD ICA PRODUCTS JSON
// =========================

var productsJsonPath = Path.Combine(
    AppContext.BaseDirectory,
    "Data",
    "SeedFiles",
    "ica-products.json"
);

var productsJson = await File.ReadAllTextAsync(productsJsonPath);

var icaProducts = JsonSerializer.Deserialize<List<SeedProductData>>(
    productsJson,
    new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    }
)!;

foreach (var item in icaProducts)
{
    var product = new Product
    {
        Name = item.Name,
        Category = item.Category,
        Brand = item.Brand,
        Description = item.Description,
        SearchKeywords = item.SearchKeywords,
    };

    context.Products.Add(product);
    await context.SaveChangesAsync();

    context.Inventories.Add(new Inventory
    {
        StoreId = groceryStore.Id,
        ProductId = product.Id,
        Price = item.Price,
        Quantity = item.Quantity
    });

    if (!nodeLookup.ContainsKey(item.NodeKey))
    {
        throw new Exception($"NodeKey {item.NodeKey} not found for product {item.Name}");
    }

    var node = nodeLookup[item.NodeKey];

    context.ProductLocations.Add(new ProductLocation
    {
        StoreId = groceryStore.Id,
        ProductId = product.Id,
        NodeId = node.Id,
        Aisle = item.Aisle,
        Shelf = item.Shelf
    });
}

await context.SaveChangesAsync();

            // =========================
            // BYGGHALLEN NODES
            // =========================

            var hEntrance = new StoreMapNode
            {
                StoreId = hardwareStore.Id,
                Label = "Entré",
                NodeType = "Entrance",
                X = 50,
                Y = 50
            };

            var hAisle1 = new StoreMapNode
            {
                StoreId = hardwareStore.Id,
                Label = "Avd. Skruv",
                NodeType = "Aisle",
                X = 150,
                Y = 50
            };

            var hAisle2 = new StoreMapNode
            {
                StoreId = hardwareStore.Id,
                Label = "Avd. Färg",
                NodeType = "Aisle",
                X = 150,
                Y = 150
            };

            var hCheckout = new StoreMapNode
            {
                StoreId = hardwareStore.Id,
                Label = "Kassa",
                NodeType = "Checkout",
                X = 250,
                Y = 150
            };

            context.StoreMapNodes.AddRange(
                hEntrance,
                hAisle1,
                hAisle2,
                hCheckout
            );

            await context.SaveChangesAsync();

            // =========================
            // BYGGHALLEN EDGES
            // =========================

            void AddBidirectionalEdge(
                Store store,
                StoreMapNode a,
                StoreMapNode b,
                double distance
            )
            {
                context.StoreMapEdges.Add(new StoreMapEdge
                {
                    StoreId = store.Id,
                    FromNodeId = a.Id,
                    ToNodeId = b.Id,
                    Distance = distance
                });

                context.StoreMapEdges.Add(new StoreMapEdge
                {
                    StoreId = store.Id,
                    FromNodeId = b.Id,
                    ToNodeId = a.Id,
                    Distance = distance
                });
            }

            AddBidirectionalEdge(hardwareStore, hEntrance, hAisle1, 10);
            AddBidirectionalEdge(hardwareStore, hAisle1, hAisle2, 12);
            AddBidirectionalEdge(hardwareStore, hAisle2, hCheckout, 8);

            await context.SaveChangesAsync();
            
        }
    }
}