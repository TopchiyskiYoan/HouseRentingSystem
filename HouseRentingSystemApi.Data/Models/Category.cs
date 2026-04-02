using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using static HouseRentingSystemApi.Data.SchemaLimits.CategoryFields;

namespace HouseRentingSystemApi.Data.Models;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(NameMaxLength)]
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<House> Houses { get; set; } = new List<House>();
}
