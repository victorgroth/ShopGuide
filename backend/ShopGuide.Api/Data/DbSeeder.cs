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

            // =========================
            // PRODUCTS
            // =========================

            var milk = new Product
            {
                Name = "Mjölk 1L",
                Category = "Mejeri",
                Brand = "Arla"
            };

            var bread = new Product
            {
                Name = "FormFranska",
                Category = "Bröd",
                Brand = "Pågen"
            };

            var butter = new Product
            {
                Name = "Smör 500g",
                Category = "Mejeri",
                Brand = "Arla"
            };

            var pasta = new Product
            {
                Name = "Pasta 500g",
                Category = "Torrvaror",
                Brand = "Barilla"
            };

            var coffee = new Product
            {
                Name = "Kaffe 450g",
                Category = "Dryck",
                Brand = "Zoegas"
            };

            context.Products.AddRange(
                milk,
                bread,
                butter,
                pasta,
                coffee
            );

            await context.SaveChangesAsync();

            // =========================
            // INVENTORY
            // =========================

            context.Inventories.AddRange(
                new Inventory
                {
                    StoreId = groceryStore.Id,
                    ProductId = milk.Id,
                    Price = 16.90m,
                    Quantity = 50
                },
                new Inventory
                {
                    StoreId = groceryStore.Id,
                    ProductId = bread.Id,
                    Price = 24.90m,
                    Quantity = 30
                },
                new Inventory
                {
                    StoreId = groceryStore.Id,
                    ProductId = butter.Id,
                    Price = 34.90m,
                    Quantity = 25
                },
                new Inventory
                {
                    StoreId = groceryStore.Id,
                    ProductId = pasta.Id,
                    Price = 19.90m,
                    Quantity = 60
                },
                new Inventory
                {
                    StoreId = groceryStore.Id,
                    ProductId = coffee.Id,
                    Price = 54.90m,
                    Quantity = 18
                }
            );

            await context.SaveChangesAsync();

            // =========================
            // PRODUCT LOCATIONS
            // =========================

            context.ProductLocations.AddRange(
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = milk.Id,
                    NodeId = nodeLookup["N40"].Id,
                    Aisle = "Mejeri",
                    Shelf = "Kyldisk"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = bread.Id,
                    NodeId = nodeLookup["N39"].Id,
                    Aisle = "Bageri",
                    Shelf = "Brödhylla"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = butter.Id,
                    NodeId = nodeLookup["N40"].Id,
                    Aisle = "Mejeri",
                    Shelf = "Mejeri"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = pasta.Id,
                    NodeId = nodeLookup["N22"].Id,
                    Aisle = "Pasta",
                    Shelf = "Torrvaror"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = coffee.Id,
                    NodeId = nodeLookup["N13"].Id,
                    Aisle = "Kaffe/Te",
                    Shelf = "Dryck"
                }
            );

            await context.SaveChangesAsync();
        }
    }
}