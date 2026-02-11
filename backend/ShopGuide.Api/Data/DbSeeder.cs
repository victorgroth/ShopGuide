using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Models;

namespace ShopGuide.Api.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            //Så att vi inte dubblerar datan vi har redan
            if (await context.Stores.AnyAsync())
                return;

            //Stores (2 demo butiker)
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

            // Map Nodes (Enkel karta till att börja med.)
            var gEntrance = new StoreMapNode { StoreId = groceryStore.Id, Label = "Entre", NodeType = "Entrance", X = 50, Y = 50 };
            var gAisle1 = new StoreMapNode { StoreId = groceryStore.Id, Label = "Gång 1", NodeType = "Aisle", X = 150, Y = 50 };
            var gAisle2 = new StoreMapNode { StoreId = groceryStore.Id, Label = "Gång 2", NodeType = "Aisle", X = 150, Y = 150 };
            var gCheckout = new StoreMapNode { StoreId = groceryStore.Id, Label = "Kassa", NodeType = "Checkout", X = 250, Y = 150 };

            var hEntrance = new StoreMapNode { StoreId = hardwareStore.Id, Label = "Entre", NodeType = "Entrance", X = 50, Y = 50 };
            var hAisle1 = new StoreMapNode { StoreId = hardwareStore.Id, Label = "Avd. Skruv", NodeType = "Aisle", X = 150, Y = 50 };
            var hAisle2 = new StoreMapNode { StoreId = hardwareStore.Id, Label = "Avd. Färg", NodeType = "Aisle", X = 150, Y = 150 };
            var hCheckout = new StoreMapNode { StoreId = hardwareStore.Id, Label = "Kassa", NodeType = "Checkout", X = 250, Y = 150 };

            context.StoreMapNodes.AddRange(gEntrance, gAisle1, gAisle2, gCheckout, hEntrance, hAisle1, hAisle2, hCheckout);
            await context.SaveChangesAsync();

            //Map edges (Koppla noderna)

            //Lägger edges i båda riktningarna (grafen blir gångbar åt båda håll)
            void AddBidirectionalEdge(Store store, StoreMapNode a, StoreMapNode b, double distance)
            {
                context.StoreMapEdges.Add(new StoreMapEdge { StoreId = store.Id, FromNodeId = a.Id, ToNodeId = b.Id, Distance = distance });
                context.StoreMapEdges.Add(new StoreMapEdge { StoreId = store.Id, FromNodeId = b.Id, ToNodeId = a.Id, Distance = distance });
            }

            AddBidirectionalEdge(groceryStore, gEntrance, gAisle1, 10);
            AddBidirectionalEdge(groceryStore, gAisle1, gAisle2, 12);
            AddBidirectionalEdge(groceryStore, gAisle2, gCheckout, 8);

            AddBidirectionalEdge(hardwareStore, hEntrance, hAisle1, 10);
            AddBidirectionalEdge(hardwareStore, hAisle1, hAisle2, 12);
            AddBidirectionalEdge(hardwareStore, hAisle2, hCheckout, 8);

            await context.SaveChangesAsync();


            //Products (5 per butik)
            var milk = new Product { Name = "Mjölk 1L", Category = "Mejeri", Brand = "Arla" };
            var bread = new Product { Name = "FormFranska", Category = "Bröd", Brand = "Pågen" };
            var butter = new Product { Name = "Smör 500g", Category = "Mejeri", Brand = "Arla" };
            var pasta = new Product { Name = "Pasta 500g", Category = "Torrvaror", Brand = "Barilla" };
            var coffee = new Product { Name = "Kaffe 450g", Category = "Dryck", Brand = "Zoegas" };

            var screws = new Product { Name = "Skruv 5mm (100-pack)", Category = "Skruv", Brand = "FixIt" };
            var paint = new Product { Name = "Väggfärg 2.5L", Category = "Färg", Brand = "ColorPro" };
            var hammer = new Product { Name = "Hammare", Category = "Verktyg", Brand = "Bahco" };
            var nails = new Product { Name = "Spik (200-pack)", Category = "Fästdon", Brand = "FixIt" };
            var tapeMeasure = new Product { Name = "Måttband 5m", Category = "Mätverktyg", Brand = "Stanley" };

            context.Products.AddRange(milk, bread, butter, pasta, coffee, screws, paint, hammer, nails, tapeMeasure);
            await context.SaveChangesAsync();


            //Inventory (Pris + lager per butik)
            context.Inventories.AddRange(
                // ICA Maxi Mölndal (5 produkter)
                new Inventory { StoreId = groceryStore.Id, ProductId = milk.Id, Price = 16.90m, Quantity = 50 },
                new Inventory { StoreId = groceryStore.Id, ProductId = bread.Id, Price = 24.90m, Quantity = 30 },
                new Inventory { StoreId = groceryStore.Id, ProductId = butter.Id, Price = 34.90m, Quantity = 25 },
                new Inventory { StoreId = groceryStore.Id, ProductId = pasta.Id, Price = 19.90m, Quantity = 60 },
                new Inventory { StoreId = groceryStore.Id, ProductId = coffee.Id, Price = 54.90m, Quantity = 18 },

                // ByggHallen Sisjön (5 produkter)
                new Inventory { StoreId = hardwareStore.Id, ProductId = screws.Id, Price = 79.00m, Quantity = 20 },
                new Inventory { StoreId = hardwareStore.Id, ProductId = paint.Id, Price = 299.00m, Quantity = 12 },
                new Inventory { StoreId = hardwareStore.Id, ProductId = hammer.Id, Price = 199.00m, Quantity = 10 },
                new Inventory { StoreId = hardwareStore.Id, ProductId = nails.Id, Price = 59.00m, Quantity = 40 },
                new Inventory { StoreId = hardwareStore.Id, ProductId = tapeMeasure.Id, Price = 89.00m, Quantity = 15 }
            );
            await context.SaveChangesAsync();


            //ProductLocation (Var i butiken produkten finns)
            context.ProductLocations.AddRange(
                // ICA Maxi Mölndal (sprid över noder för att rutten ska märkas)
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = milk.Id,
                    NodeId = gAisle2.Id,
                    Aisle = "Gång 2",
                    Shelf = "Kyldisk"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = bread.Id,
                    NodeId = gAisle1.Id,
                    Aisle = "Gång 1",
                    Shelf = "Brödhylla"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = butter.Id,
                    NodeId = gAisle2.Id,
                    Aisle = "Gång 2",
                    Shelf = "Mejeri"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = pasta.Id,
                    NodeId = gCheckout.Id,   // ligger nära kassan
                    Aisle = "Nära kassan",
                    Shelf = "Torrvaror"
                },
                new ProductLocation
                {
                    StoreId = groceryStore.Id,
                    ProductId = coffee.Id,
                    NodeId = gAisle1.Id,
                    Aisle = "Gång 1",
                    Shelf = "Kaffe/Te"
                },

                // ByggHallen Sisjön (sprid över noder)
                new ProductLocation
                {
                    StoreId = hardwareStore.Id,
                    ProductId = screws.Id,
                    NodeId = hAisle1.Id,
                    Aisle = "Avd. Skruv",
                    Shelf = "Hyllplan 2"
                },
                new ProductLocation
                {
                    StoreId = hardwareStore.Id,
                    ProductId = paint.Id,
                    NodeId = hAisle2.Id,
                    Aisle = "Avd. Färg",
                    Shelf = "Hyllplan 1"
                },
                new ProductLocation
                {
                    StoreId = hardwareStore.Id,
                    ProductId = hammer.Id,
                    NodeId = hCheckout.Id,   // nära kassan
                    Aisle = "Kassaområdet",
                    Shelf = "Verktyg"
                },
                new ProductLocation
                {
                    StoreId = hardwareStore.Id,
                    ProductId = nails.Id,
                    NodeId = hAisle1.Id,
                    Aisle = "Avd. Skruv",
                    Shelf = "Fästdon"
                },
                new ProductLocation
                {
                    StoreId = hardwareStore.Id,
                    ProductId = tapeMeasure.Id,
                    NodeId = hAisle2.Id,
                    Aisle = "Avd. Färg",
                    Shelf = "Mätverktyg"
                }
            );
            await context.SaveChangesAsync();
        }
    }
}