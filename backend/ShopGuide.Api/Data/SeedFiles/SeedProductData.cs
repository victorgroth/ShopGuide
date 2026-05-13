namespace ShopGuide.Api.Data.SeedFiles;

public class SeedProductData
{
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Brand { get; set; } = "";

    public decimal Price { get; set; }
    public int Quantity { get; set; }

    public string NodeKey { get; set; } = "";
    public string Aisle { get; set; } = "";
    public string Shelf { get; set; } = "";
}