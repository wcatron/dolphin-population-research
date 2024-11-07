#!/usr/bin/env deno run --allow-read --allow-write

import { parse } from "https://deno.land/std@0.122.0/encoding/csv.ts";
import { walk } from "https://deno.land/std@0.122.0/fs/mod.ts";
import * as eta from "https://deno.land/x/eta@v1.12.3/mod.ts";

interface Observation {
  name: string;
  location: string;
  type: string;
  value: string;
}

interface DolphinData {
  name: string;
  age: string;
  gender: string;
  observations: Set<string>;
  leftPhotos: string[];
  rightPhotos: string[];
  parents: Set<string>;
  children: Set<string>;
}

const directory = "./observations"; // Set your target directory here
const outputHtmlFile = "index.html";

// Map to store dolphin data
const dolphins = new Map<string, DolphinData>();

// Function to extract date from photo path
function extractDate(photoPath: string): string {
  const regex = /observations\/(\d{4}-\d{2}-\d{2})\//;
  const match = photoPath.match(regex);
  return match ? match[1] : "Unknown Date";
}

// Walk through the directory to find CSV files
for await (const entry of walk(directory, { exts: [".csv"], maxDepth: 2 })) {
  const csvContent = await Deno.readTextFile(entry.path);
  const records = await parse(csvContent, {
    skipFirstRow: true,
    columns: ["name", "location", "type", "value"],
  }) as unknown as Observation[];

  for (const { name, location, type, value } of records) {
    let dolphin = dolphins.get(name);
    if (!dolphin) {
      dolphin = {
        name,
        age: "Unknown",
        gender: "unknown",
        observations: new Set<string>(),
        leftPhotos: [],
        rightPhotos: [],
        parents: new Set<string>(),
        children: new Set<string>(),
      };
      dolphins.set(name, dolphin);
    }

    if (type === "id_photo_left" || type === "id_left") {
      const photo = value;
      const date = extractDate(photo);
      const observation = `${date}, ${location}`;
      dolphin.observations.add(observation);
      dolphin.leftPhotos.push(photo);
    } else if (type === "id_photo_right" || type === "id_right") {
      const photo = value;
      const date = extractDate(photo);
      const observation = `${date}, ${location}`;
      dolphin.observations.add(observation);
      dolphin.rightPhotos.push(photo);
    } else if (type === "child_of") {
      const parentName = value;
      dolphin.parents.add(parentName);

      // Ensure parent dolphin exists in the map
      let parentDolphin = dolphins.get(parentName);
      if (!parentDolphin) {
        parentDolphin = {
          name: parentName,
          age: "Unknown",
          gender: "unknown",
          observations: new Set<string>(),
          leftPhotos: [],
          rightPhotos: [],
          parents: new Set<string>(),
          children: new Set<string>(),
        };
        dolphins.set(parentName, parentDolphin);
      }
      parentDolphin.children.add(name);
    } else if (type === "gender") {
      const genderValue = value.toLowerCase();
      if (["male", "female", "unknown"].includes(genderValue)) {
        dolphin.gender = genderValue;
      }
    }
  }
}

// Convert dolphins map to array and sort alphabetically by name
const dolphinArray = Array.from(dolphins.values());
dolphinArray.sort((a, b) => a.name.localeCompare(b.name));

// Read the template file
const template = await Deno.readTextFile("nodes/template.eta");

// Configure Eta
eta.configure({
  autoEscape: false,
});

// Render the template with data
const htmlContent = eta.render(template, { dolphins: dolphinArray }) as string;

// Write the HTML content to a file
await Deno.writeTextFile(outputHtmlFile, htmlContent);
console.log(`HTML report generated: ${outputHtmlFile}`);
