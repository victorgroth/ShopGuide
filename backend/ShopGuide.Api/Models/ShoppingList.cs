namespace ShopGuide.Api.Models
{
    public class ShoppingList
    {
        public int Id { get; set; } //PK

        public int StoreId { get; set; } //FK till Store
        public Store Store { get; set; } = null!;

        public string UserId { get; set; } = string.Empty; //Senare: Kopplas till identity user.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();
    }
}