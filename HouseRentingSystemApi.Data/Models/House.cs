using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using static HouseRentingSystemApi.Data.SchemaLimits.HouseFields;

namespace HouseRentingSystemApi.Data.Models;

public class House
{
    public int Id { get; set; }

    [Required]
    [MaxLength(TitleMaxLength)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(AddressMaxLength)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(DescriptionMaxLength)]
    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public decimal PricePerMonth { get; set; }

    public PropertyKind Kind { get; set; } = PropertyKind.TwoBedroom;

    [ForeignKey(nameof(Category))]
    public int CategoryId { get; set; }

    [JsonIgnore]
    public Category? Category { get; set; }
}
