
namespace ShopGuide.Api.DTOs
{
    public class ProductInStoreDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public int Quantity { get; set; }

        public string Aisle { get; set; } = string.Empty;
        public string Shelf { get; set; } = string.Empty;

        public int? NodeId { get; set; }
        public string? NodeLabel { get; set; }
    }
}