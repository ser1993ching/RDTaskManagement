namespace R&DTaskSystem.Tests;

/// <summary>
/// 测试基础类
/// </summary>
public class TestBase
{
    protected readonly MockRepository _mockRepository;
    protected readonly IMapper _mapper;

    public TestBase()
    {
        _mockRepository = new MockRepository(MockBehavior.Strict);

        // 配置AutoMapper
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<AutoMapperProfile>();
        });
        _mapper = config.CreateMapper();
    }
}
