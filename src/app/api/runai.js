
"use server"; // Tells Next.js that this logic should run on the server

import { exec } from "child_process";
import path from "path";
console.log('runai run')
export async function runPythonScript() {
  console.log("api run")
  const pythonScriptPath = path.join(process.cwd(), "AI", "poly2.py");
  const command = `python3 ${pythonScriptPath} "${data}"}`;
  // Run the Python script using exec
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing Python script: ${error.message}`);
      }
      if (stderr) {
        reject(`Python script stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
  console.log("api ran")
}
