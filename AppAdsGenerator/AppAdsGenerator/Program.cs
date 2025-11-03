var directoryPath = Directory.GetParent(Environment.CurrentDirectory).Parent.Parent.Parent.FullName;
var dataSourcesPath = Path.Combine(directoryPath, "DataSources");
var dataSourcesTextFiles = Directory.GetFiles(dataSourcesPath);

var result = new List<string>();
foreach (var file in dataSourcesTextFiles)
{
    if (!file.EndsWith(".txt"))
    {
        continue;
    }
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
        result.Add(text);
    }
}
result.Sort();
for (var index = 0; index < result.Count; index++)
{
    var res = result[index];

    // Remove inline comments (anything after #)
    var hashIndex = res.IndexOf('#');
    if (hashIndex >= 0)
    {
        res = res.Substring(0, hashIndex);
    }

    // Trim spaces
    res = res.Trim();

    // Remove extra spaces around commas (e.g., "a , b ,c" → "a,b,c")
    res = string.Join(",", res.Split(',')
        .Select(part => part.Trim())
        .Where(part => !string.IsNullOrEmpty(part)));

    // Skip empty results
    if (string.IsNullOrWhiteSpace(res))
    {
        continue;
    }
    // Replace the cleaned line back into the list
    result[index] = res;
}
result = result.ToHashSet().ToList();
var output = string.Join("\n", result);
var outputFileParent = Directory.GetParent(Environment.CurrentDirectory).Parent.Parent.Parent.Parent;
var outputPath = Path.Combine(outputFileParent.FullName, "app-ads.txt");
File.WriteAllText(outputPath, output);