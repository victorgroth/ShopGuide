namespace ShopGuide.Api.DTOs
{
    public class RouteSegmentDto
    {
        public int StepNumber { get; set; }
        public string Title { get; set; } = "";
        public string? ProductName { get; set; }
        public int? ProductId { get; set; }
        public int FromNodeId { get; set; }
        public int ToNodeId { get; set; }
        public List<int> PathNodeIds { get; set; } = new();
    }
}