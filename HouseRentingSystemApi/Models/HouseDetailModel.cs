using HouseRentingSystemApi.Models.Enums;
using System.ComponentModel.DataAnnotations;

using static HouseRentingSystemApi.Data.DataConstants.DataConstants.House;

namespace HouseRentingSystemApi.Models
{
    public class HouseDetailModel
    {
        // Populated only in responses
        public int? Id { get; set; }

        [MaxLength(TitleMaxLength)]
        public string Title { get; set; }

        [MaxLength(AddressMaxLength)]
        public string Address { get; set; }

        public string ImageUrl { get; set; }

        public string Description { get; set; }

        public decimal PricePerMonth { get; set; }

        public CategoryViewEnum Category { get; set; }

        // Populated only in responses — ignored on create/edit input
        public string? UserId { get; set; }
    }
}
