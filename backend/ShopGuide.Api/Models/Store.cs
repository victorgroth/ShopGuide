namespace ShopGuide.Api.Models
{
    public class Store
    {
        public int Id { get; set; }          // PK
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string StoreType { get; set; } = string.Empty; // ex: "Grocery", "Hardware"
    }
}
