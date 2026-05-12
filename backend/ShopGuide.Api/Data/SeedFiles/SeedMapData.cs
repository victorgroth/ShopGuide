namespace ShopGuide.Api.Data.SeedFiles;

public class SeedMapData
{
    public int ImageWidth { get; set; }
    public int ImageHeight { get; set; }
    
    public List<SeedMapNode> Nodes { get; set; } = new();
    public List<SeedMapEdge> Edges { get; set; } = new();
}

public class SeedMapNode
{
    public string Key { get; set; } = "";
    public string Label { get; set; } = "";
    public string NodeType { get; set; } = "";

    public int X { get; set; }
    public int Y { get; set; }
}

public class SeedMapEdge
{
    public string From { get; set; } = "";
    public string To { get; set; } = "";

    public double Distance { get; set; }
}