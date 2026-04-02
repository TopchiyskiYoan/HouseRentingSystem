namespace HouseRentingSystemApi.Data;

/// <summary>Field length limits shared by persistence and validation.</summary>
public static class SchemaLimits
{
    public static class HouseFields
    {
        public const int TitleMaxLength = 50;
        public const int AddressMaxLength = 150;
        public const int DescriptionMaxLength = 500;
    }

    public static class CategoryFields
    {
        public const int NameMaxLength = 50;
    }
}
