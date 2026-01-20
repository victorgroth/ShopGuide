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
    }
}
