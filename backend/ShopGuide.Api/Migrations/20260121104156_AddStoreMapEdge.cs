using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopGuide.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreMapEdge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StoreMapEdges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StoreId = table.Column<int>(type: "INTEGER", nullable: false),
                    FromNodeId = table.Column<int>(type: "INTEGER", nullable: false),
                    ToNodeId = table.Column<int>(type: "INTEGER", nullable: false),
                    Distance = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoreMapEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoreMapEdges_StoreMapNodes_FromNodeId",
                        column: x => x.FromNodeId,
                        principalTable: "StoreMapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StoreMapEdges_StoreMapNodes_ToNodeId",
                        column: x => x.ToNodeId,
                        principalTable: "StoreMapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StoreMapEdges_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StoreMapEdges_FromNodeId",
                table: "StoreMapEdges",
                column: "FromNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_StoreMapEdges_StoreId",
                table: "StoreMapEdges",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_StoreMapEdges_ToNodeId",
                table: "StoreMapEdges",
                column: "ToNodeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoreMapEdges");
        }
    }
}
