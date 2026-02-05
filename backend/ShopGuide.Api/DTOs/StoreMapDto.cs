namespace ShopGuide.Api.DTOs
{
    public class StoreMapDto
    {
        public int StoreId { get; set; }

        public List<StoreMapNodeDto> Nodes { get; set; } = new();
        public List<StoreMapEdgeDto> Edges { get; set; } = new();
    }

    public class StoreMapNodeDto
    {
        public int Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string NodeType { get; set; } = string.Empty;
        public int X { get; set; }
        public int Y { get; set; }
    }

    public class StoreMapEdgeDto
    {
        public int FromNodeId { get; set; }
        public int ToNodeId { get; set; }
        public double Distance { get; set; }
    }
}