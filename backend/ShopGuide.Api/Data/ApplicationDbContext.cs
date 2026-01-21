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
        }
    }
}
