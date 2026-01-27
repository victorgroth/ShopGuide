namespace ShopGuide.Api.Models
{
    public class ProductLocation
    {
        public int Id { get; set;} //PK

        public int StoreId { get; set; } //FK till store
        public Store Store { get; set; } = null!;

        public int ProductId { get; set; } //FK till produkt
        public Product Product { get; set; } = null!;

        public int NodeId { get; set; } //FK till storemapnode (plats i butiken)
        public StoreMapNode Node { get; set; } = null!;

        public string Aisle { get; set; } = string.Empty; //ex gång 3
        public string Shelf { get; set; } = string.Empty; // ex Hyllplan 2
    }

}