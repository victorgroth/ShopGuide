namespace ShopGuide.Api.Models
{
    public class Inventory
    {
        public int Id { get; set; } //PK

        public int StoreId { get; set; } //FK till Store
        public Store Store { get; set; } = null!;

        public int ProductId { get; set; } //FK till Product
        public Product Product { get; set; } = null!;

        public decimal Price { get; set; } //25,90
        public int Quantity { get; set; } //Antal i lager
    }
}