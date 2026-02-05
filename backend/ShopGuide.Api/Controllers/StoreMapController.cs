using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopGuide.Api.Data;
using ShopGuide.Api.DTOs;

namespace ShopGuide.Api.Controllers
{
    [ApiController]
    [Route("/api/stores")]
    public class StoreMapController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StoreMapController(ApplicationDbContext context)
        {
            _context = context;
        }

        //Get: api/stores/{storeId}/map
        [HttpGet("{storeId:int}/map")]
        public async Task<ActionResult<StoreMapDto>> GetStoreMap(int storeId)
        {
            var StoreExists = await _context.Stores.AnyAsync(s => s.Id == storeId);
            if(!StoreExists)
                return NotFound($"Store with id {storeId} not found.");

            var nodes = await _context.StoreMapNodes
            .Where(n => n.StoreId == storeId)
            .Select(n => new StoreMapNodeDto
            {
                Id = n.Id,
                Label = n.Label,
                NodeType = n.NodeType,
                X = n.X,
                Y = n.Y
            })
            .ToListAsync();

            var edges = await _context.StoreMapEdges
            .Where(e => e.StoreId == storeId)
            .Select(e => new StoreMapEdgeDto
            {
                FromNodeId = e.FromNodeId,
                ToNodeId = e.ToNodeId,
                Distance = e.Distance
            })
            .ToListAsync();

            var map = new StoreMapDto
            {
                StoreId = storeId,
                Nodes = nodes,
                Edges = edges
            };
            return Ok(map);
        }
    }
}