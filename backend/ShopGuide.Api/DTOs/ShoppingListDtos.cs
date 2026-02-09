namespace ShopGuide.Api.DTOs
{
    public class CreateShoppingListRequest
    {
        public int StoreId { get; set; }
        public string? UserId { get; set; } //Används senare
    }

    public class AddShoppingListItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class ShoppingListDto
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public List<ShoppingListItemDto> Items { get; set; } = new();
    }

    public class ShoppingListItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public int? NodeId { get; set; }
        public string? NodeLabel { get; set; }

        public int? OrderIndex { get; set; }
    }
}