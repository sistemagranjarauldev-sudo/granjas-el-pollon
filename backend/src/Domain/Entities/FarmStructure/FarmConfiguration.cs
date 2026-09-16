using SistemaGranja.Domain.Common;

namespace SistemaGranja.Domain.Entities.FarmStructure;

public class FarmConfiguration : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ValueType { get; set; } = "string"; // int, decimal, bool, string, json
}
