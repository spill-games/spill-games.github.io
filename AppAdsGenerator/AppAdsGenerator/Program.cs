var directoryPath = Directory.GetParent(Environment.CurrentDirectory).Parent.Parent.Parent.FullName;
var dataSourcesPath = Path.Combine(directoryPath, "DataSources");
var dataSourcesTextFiles = Directory.GetFiles(dataSourcesPath);

var result = new List<string>();
foreach (var file in dataSourcesTextFiles)
{
    var textsFromFile = File.ReadLines(file);
    foreach (var text in textsFromFile)
    {
        if (string.IsNullOrEmpty(text) || string.IsNullOrWhiteSpace(text))
        {
            continue;
        }
        if (text.StartsWith('#'))
        {
            continue;
        }
        result.Add(text.Trim().Replace(", ", ","));
    }
}
result.Sort();
result = result.ToHashSet().ToList();
var output = string.Join("\n", result);
var outputFileParent = Directory.GetParent(Environment.CurrentDirectory).Parent.Parent.Parent.Parent;
var outputPath = Path.Combine(outputFileParent.FullName, "app-ads.txt");
File.WriteAllText(outputPath, output);