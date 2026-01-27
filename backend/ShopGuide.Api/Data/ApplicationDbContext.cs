using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Models;

namespace ShopGuide.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Store> Stores => Set<Store>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<StoreMapNode> StoreMapNodes => Set<StoreMapNode>();
        public DbSet<StoreMapEdge> StoreMapEdges => Set<StoreMapEdge>();
        public DbSet<ProductLocation> ProductLocations => Set<ProductLocation>();
        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
        public DbSet<ShoppingListItem> ShoppingListItems => Set<ShoppingListItem>();



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<StoreMapEdge>()
                .HasOne(e => e.FromNode)
                .WithMany(n => n.EdgesFrom)
                .HasForeignKey(e => e.FromNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StoreMapEdge>()
                .HasOne(e => e.ToNode)
                .WithMany(n => n.EdgesTo)
                .HasForeignKey(e => e.ToNodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductLocation>()
                .HasOne(pl => pl.Node)
                .WithMany(n => n.ProductLocations)
                .HasForeignKey(pl => pl.NodeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductLocation>()
                .HasOne(pl => pl.Store)
                .WithMany(s => s.ProductLocations)
                .HasForeignKey(pl => pl.StoreId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductLocation>()
                .HasOne(pl => pl.Product)
                .WithMany(p => p.ProductLocations)
                .HasForeignKey(pl => pl.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Store)
                .WithMany(s => s.Inventories)
                .HasForeignKey(i => i.StoreId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Product)
                .WithMany(p => p.Inventories)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventory>()
                .HasIndex(i => new { i.StoreId, i.ProductId })
                .IsUnique();

            modelBuilder.Entity<ShoppingList>()
                .HasOne(sl => sl.Store)
                .WithMany(s => s.ShoppingLists)
                .HasForeignKey(sl => sl.StoreId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShoppingListItem>()
                .HasOne(i => i.Product)
                .WithMany()
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShoppingListItem>()
                .HasOne(i => i.Node)
                .WithMany()
                .HasForeignKey(i => i.NodeId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
