const { spawn } = require('child_process');

const python = spawn('python3', ['my_script.py']);

python.stdin.write(JSON.stringify({ name: "Anshul" }));
python.stdin.end();

python.stdout.on('data', (data) => {
  const output = JSON.parse(data.toString());
  console.log(output.message);  // Hello, Anshul!
});
