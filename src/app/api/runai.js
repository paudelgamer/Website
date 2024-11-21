
"use server"; // Tells Next.js that this logic should run on the server

import { exec } from "child_process";
import path from "path";

export async function runPythonScript() {
  const pythonScriptPath = path.join(process.cwd(), "AI", "poly2.py");
  console.log("hello")
  // Run the Python script using exec
  return new Promise((resolve, reject) => {
    exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing Python script: ${error.message}`);
      }
      if (stderr) {
        reject(`Python script stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}
