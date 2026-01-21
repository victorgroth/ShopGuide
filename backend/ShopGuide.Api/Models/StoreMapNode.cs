

namespace ShopGuide.Api.Models
{
    public class StoreMapNode
    {
         public int Id { get; set; }                 // PK

        public int StoreId { get; set; }            // FK -> Store
        public Store Store { get; set; } = null!;

        public string Label { get; set; } = string.Empty;    // ex: "Gång 1", "Entré"
        public string NodeType { get; set; } = string.Empty; // ex: "Aisle", "Entrance", "Checkout"

        // Position för karta / SVG
        public int X { get; set; }
        public int Y { get; set; }

        public ICollection<StoreMapEdge> EdgesFrom { get; set; } = new List<StoreMapEdge>();
        public ICollection<StoreMapEdge> EdgesTo { get; set; } = new List<StoreMapEdge>();

    }
}