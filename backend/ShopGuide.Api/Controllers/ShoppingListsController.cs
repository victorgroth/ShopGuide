using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Data;
using ShopGuide.Api.DTOs;
using ShopGuide.Api.Models;

namespace ShopGuide.Api.Controllers
{
    [ApiController]
    [Route("api/shoppingList")]
    public class ShoppingListsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShoppingListsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/shoppinglists
        [HttpPost]
        public async Task<ActionResult<ShoppingListDto>> CreateShoppingList(CreateShoppingListRequest request)
        {
            //Validera butik
            var StoreExists = await _context.Stores.AnyAsync(s => s.Id == request.StoreId);
            if (!StoreExists)
                return NotFound($"Store with id {request.StoreId} not found.");

            var list = new ShoppingList
            {
                StoreId = request.StoreId,
                UserId = string.IsNullOrWhiteSpace(request.UserId) ? "demo-user" : request.UserId.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ShoppingLists.Add(list);
            await _context.SaveChangesAsync();

            var dto = new ShoppingListDto
            {
                Id = list.Id,
                StoreId = list.StoreId,
                UserId = list.UserId,
                CreatedAt = list.CreatedAt,
                Items = new List<ShoppingListItemDto>()
            };

            return CreatedAtAction(nameof(GetShoppingList), new { id = list.Id }, dto);
        }

        // GET: api/shoppinglists/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ShoppingListDto>> GetShoppingList(int id)
        {
            var list = await _context.ShoppingLists
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (list == null)
                return NotFound($"Shoppinglist with id {id} not found.");

            var items = await _context.ShoppingListItems
                .Where(i => i.ShoppingListId == id)
                .Join(_context.Products,
                i => i.ProductId,
                p => p.Id,
                (i, p) => new { i, p })
            .GroupJoin(_context.StoreMapNodes,
                ip => ip.i.NodeId,
                n => n.Id,
                (ip, nodes) => new { ip.i, ip.p, node = nodes.FirstOrDefault() })
            .Select(x => new ShoppingListItemDto
            {
                Id = x.i.Id,
                ProductId = x.p.Id,
                ProductName = x.p.Name,
                Quantity = x.i.Quantity,
                NodeId = x.i.NodeId,
                NodeLabel = x.node != null ? x.node.Label : null,
                OrderIndex = x.i.OrderIndex,
            })
            .OrderBy(x => x.OrderIndex ?? int.MaxValue)
            .ThenBy(x => x.ProductName)
            .ToListAsync();

            var dto = new ShoppingListDto
            {
                Id = list.Id,
                StoreId = list.StoreId,
                UserId = list.UserId,
                CreatedAt = list.CreatedAt,
                Items = items
            };
            return Ok(dto);
        }

        //POST: api/Shoppinglist/{id}/items
        [HttpPost("{id:int}/items")]
        public async Task<ActionResult<ShoppingListItemDto>> AddItem(int id, AddShoppingListItemRequest request)
        {
            if(request.Quantity <= 0)
                return BadRequest("Quantity must be at least 1.");

            var list = await _context.ShoppingLists.FirstOrDefaultAsync(x => x.Id == id);
            if (list == null)
                return NotFound($"Shoppinglist with {id} not found.");

            // säkerställ produkt
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId);
            if(product == null)
                return NotFound($"Product with id {request.ProductId} not found.");

            // hitta placering i vald butik (om den finns)
            var location = await _context.ProductLocations
                .AsNoTracking()
                .FirstOrDefaultAsync(pl => pl.StoreId == list.StoreId && pl.ProductId == product.Id);

            var item = new ShoppingListItem
            {
                ShoppingListId = list.Id,
                ProductId = product.Id,
                Quantity = request.Quantity,
                NodeId = location?.NodeId,
                OrderIndex = null
            };

            _context.ShoppingListItems.Add(item);
            await _context.SaveChangesAsync();

            string? nodeLabel = null;
            if (item.NodeId != null)
            {
                nodeLabel = await _context.StoreMapNodes
                    .Where(n => n.Id == item.NodeId)
                    .Select(n => n.Label)
                    .FirstOrDefaultAsync();
            }

            var dto = new ShoppingListItemDto
            {
                Id = item.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                NodeId = item.NodeId,
                NodeLabel = nodeLabel,
                OrderIndex = item.OrderIndex
            };
            return Ok(dto);
        }
    }
}