import fs from 'fs';

async function testModels() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let apiKey = '';
  envFile.split('\n').forEach(line => {
    if (line.startsWith('GEMINI_API_KEY=')) {
      apiKey = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  });

  if (!apiKey) {
    console.error("No API key");
    process.exit(1);
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("Available Models:");
    console.log(data.models?.map((m: any) => m.name).filter((name: string) => name.includes("flash") || name.includes("embedding")).join("\n"));
  } catch (e) {
    console.error(e);
  }
}

testModels();
