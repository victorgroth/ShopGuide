

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ShopGuide.Api.Data;
using ShopGuide.Api.DTOs;
using SQLitePCL;

namespace ShopGuide.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        //GET: api/stores/{storeId}/products
        //sök: api/stores/{storeId}/products?search=mjölk
        [HttpGet("stores/{storeId:int}/products")]
        public async Task<ActionResult<IEnumerable<ProductInStoreDto>>> GetProductsForStore(
            int storeId,
            [FromQuery] string? search = null)
        {
            //Kolla att butiken finns (tydligt 404)
            var StoreExists = await _context.Stores.AnyAsync(s => s.Id == storeId);
            if(!StoreExists)
            return NotFound($"Store with id {storeId} not found");

        //Utgår från Inventory så vi bara listar produkter som butiken faktiskt har
        var query =
            from inv in _context.Inventories
            join p in _context.Products on inv.ProductId equals p.Id
            join pl in _context.ProductLocations on new { inv.StoreId, inv.ProductId }
                equals new { pl.StoreId, pl.ProductId } into placements
            from pl in placements.DefaultIfEmpty()
            join n in _context.StoreMapNodes on pl.NodeId equals n.Id into nodes
            from n in nodes.DefaultIfEmpty()
            where inv.StoreId == storeId
            select new ProductInStoreDto
            {
                ProductId = p.Id,
                Name = p.Name,
                Category = p.Category,
                Brand = p.Brand,
                Price = inv.Price,
                Quantity = inv.Quantity,
                Aisle = pl != null ? pl.Aisle : "",
                Shelf = pl != null ? pl.Shelf : "",
                NodeId = pl != null ? pl.NodeId : null,
                NodeLabel = n != null ? n.Label : null
            };

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(s) || 
                    x.Category.ToLower().Contains(s) || 
                    x.Brand.ToLower().Contains(s));
            }
            var result = await query
                .OrderBy(x => x.Category)
                .ThenBy(x => x.Name)
                .ToListAsync();

            return Ok(result);     
        }    
    }
}