namespace ShopGuide.Api.Models
{
    public class StoreMapEdge
    {
        public int Id { get; set; }                 // PK

        public int StoreId { get; set; }            // FK -> Store
        public Store Store { get; set; } = null!;

        public int FromNodeId { get; set; }         // FK -> StoreMapNode
        public StoreMapNode FromNode { get; set; } = null!;

        public int ToNodeId { get; set; }           // FK -> StoreMapNode
        public StoreMapNode ToNode { get; set; } = null!;

        public double Distance { get; set; }        // ex: meter / “kostnad”
    }
}
