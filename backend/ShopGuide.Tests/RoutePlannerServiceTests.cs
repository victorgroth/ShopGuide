
using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Data;
using ShopGuide.Api.Models;
using ShopGuide.Api.Services;
using Xunit;

namespace ShopGuide.Tests
{
    public class RoutePlannerServiceTests
    {
        private static ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task PlanRouteAsync_SetsOrderIndex_ForItemsWithNodes()
        {
            // Arrange
            await using var context = CreateDbContext();

            var store = new Store
            {
                Name = "Test Store",
                Address = "Test",
                City = "Test",
                StoreType = "Test"
            };

            context.Stores.Add(store);
            await context.SaveChangesAsync();

            // Noder: Entrance -> Aisle1 -> Aisle2 -> Checkout
            var entrance = new StoreMapNode { StoreId = store.Id, Label = "Entré", NodeType = "Entrance", X = 0, Y = 0 };
            var aisle1 = new StoreMapNode { StoreId = store.Id, Label = "Gång 1", NodeType = "Aisle", X = 1, Y = 0 };
            var aisle2 = new StoreMapNode { StoreId = store.Id, Label = "Gång 2", NodeType = "Aisle", X = 2, Y = 0 };
            var checkout = new StoreMapNode { StoreId = store.Id, Label = "Kassa", NodeType = "Checkout", X = 3, Y = 0 };

            context.StoreMapNodes.AddRange(entrance, aisle1, aisle2, checkout);
            await context.SaveChangesAsync();

            // Edges (båda riktningar)
            context.StoreMapEdges.AddRange(
                new StoreMapEdge { StoreId = store.Id, FromNodeId = entrance.Id, ToNodeId = aisle1.Id, Distance = 1 },
                new StoreMapEdge { StoreId = store.Id, FromNodeId = aisle1.Id, ToNodeId = entrance.Id, Distance = 1 },

                new StoreMapEdge { StoreId = store.Id, FromNodeId = aisle1.Id, ToNodeId = aisle2.Id, Distance = 1 },
                new StoreMapEdge { StoreId = store.Id, FromNodeId = aisle2.Id, ToNodeId = aisle1.Id, Distance = 1 },

                new StoreMapEdge { StoreId = store.Id, FromNodeId = aisle2.Id, ToNodeId = checkout.Id, Distance = 1 },
                new StoreMapEdge { StoreId = store.Id, FromNodeId = checkout.Id, ToNodeId = aisle2.Id, Distance = 1 }
            );

            await context.SaveChangesAsync();

            // Produkter
            var p1 = new Product { Name = "Produkt A", Category = "Test", Brand = "Test" };
            var p2 = new Product { Name = "Produkt B", Category = "Test", Brand = "Test" };
            var p3 = new Product { Name = "Produkt C", Category = "Test", Brand = "Test" };
            context.Products.AddRange(p1, p2, p3);
            await context.SaveChangesAsync();

            // Shoppinglist
            var list = new ShoppingList
            {
                StoreId = store.Id,
                UserId = "test-user",
                CreatedAt = DateTime.UtcNow
            };
            context.ShoppingLists.Add(list);
            await context.SaveChangesAsync();

            // Items ligger på olika noder
            var item1 = new ShoppingListItem { ShoppingListId = list.Id, ProductId = p1.Id, Quantity = 1, NodeId = aisle2.Id };
            var item2 = new ShoppingListItem { ShoppingListId = list.Id, ProductId = p2.Id, Quantity = 1, NodeId = aisle1.Id };
            var item3 = new ShoppingListItem { ShoppingListId = list.Id, ProductId = p3.Id, Quantity = 1, NodeId = aisle2.Id }; // samma nod som item1

            context.ShoppingListItems.AddRange(item1, item2, item3);
            await context.SaveChangesAsync();

            var service = new RoutePlannerService(context);

            // Act
            await service.PlanRoute(list.Id);

            // Assert
            var items = await context.ShoppingListItems
                .Where(i => i.ShoppingListId == list.Id)
                .OrderBy(i => i.OrderIndex)
                .ToListAsync();

            Assert.All(items, i => Assert.NotNull(i.OrderIndex));

            // OrderIndex ska börja på 1 och vara stigande
            Assert.Equal(1, items.First().OrderIndex);

            // Alla items ska ha unika order index
            Assert.Equal(items.Count, items.Select(i => i.OrderIndex).Distinct().Count());

            // Greedy från entré: närmast är aisle1, sen aisle2
            // Dvs item2 (aisle1) borde komma före item1/item3 (aisle2)
            var item2Index = items.Single(i => i.Id == item2.Id).OrderIndex!.Value;
            var item1Index = items.Single(i => i.Id == item1.Id).OrderIndex!.Value;
            Assert.True(item2Index < item1Index);
        }
    }
}

