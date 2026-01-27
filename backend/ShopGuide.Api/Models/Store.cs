namespace ShopGuide.Api.Models
{
    public class Store
    {
        public int Id { get; set; }          // PK
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string StoreType { get; set; } = string.Empty; // ex: "Grocery", "Hardware"

        public ICollection<StoreMapNode> MapNodes { get; set; } = new List<StoreMapNode>(); // En butik har många noder.
        public ICollection<StoreMapEdge> MapEdges { get; set; } = new List<StoreMapEdge>();
        public ICollection<ProductLocation> ProductLocations { get; set; } = new List<ProductLocation>();
        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    }
}
