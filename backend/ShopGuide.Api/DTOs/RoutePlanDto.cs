namespace ShopGuide.Api.DTOs
{
    public class RoutePlanDto
    {
        public int ShoppingListId { get; set; }
        public List<int> FullPathNodeIds { get; set; } = new();
        public List<RouteSegmentDto> Segments { get; set; } = new();
    }
}