namespace ShopGuide.Api.Models
{
    public class Product
    {
        public int Id { get; set; }              // PK
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
    }
}
