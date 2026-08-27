import { Node } from "@/types/map";

/**
 * Expects an array of nodes within the same floor. If nodes are on different floors, the path will not be continuous.
 * @param pathNodes - Array of nodes representing the path
 * @returns A string representing the SVG path data
 */

export function generateSvgPath(pathNodes: Node[]): string {
  if (!pathNodes || pathNodes.length < 2) return "";

  const startNode = pathNodes[0];
  if (!startNode) {
    console.log("Node was not found");
    return "";
  }
  let pathString = `M ${startNode.xCoordinate} ${startNode.yCoordinate}`;

  for (let i = 1; i < pathNodes.length; i++) {
    const node = pathNodes[i];
    if (!node) {
      console.error("i don't know what to say");
      return "";
    }
    pathString += ` L ${node.xCoordinate} ${node.yCoordinate}`;
  }

  return pathString;
}
