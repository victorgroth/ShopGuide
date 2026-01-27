namespace ShopGuide.Api.Models
{
    public class ShoppingListItem
    {
        public int Id { get; set; } //PK

        public int ShoppingListId { get; set; }// FK till shoppinglist
        public ShoppingList ShoppingList { get; set; } = null!;

        public int ProductId { get; set; } //FK till product
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; } = 1;

        //För guidning senare
        public int? NodeId { get; set; } //FK till stroemapnode (var producten finns i butiken)
        public StoreMapNode? Node { get; set; }

        public int? OrderIndex { get; set; } //plockordning (beräknas senare)
    }
}