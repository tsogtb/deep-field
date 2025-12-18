export function createScene() {
    const positions = [
      // Back wall
      [-2, 0, -2], // 0
      [ 2, 0, -2], // 1
      [ 2, 3, -2], // 2
      [-2, 3, -2], // 3
  
      // Front
      [-2, 0,  2], // 4
      [ 2, 0,  2], // 5
      [-2, 3,  2], // 6
      [ 2, 3,  2], // 7
    ]
  
    return {
      positions,
  
      meshes: [
        // Floor
        {
          color: [0.25, 0.25, 0.25],
          elements: [
            [0, 5, 1],
            [0, 4, 5],
          ]
        },
  
        // Ceiling
        {
          color: [0.15, 0.15, 0.25],
          elements: [
            [3, 2, 7],
            [3, 7, 6],
          ]
        },
  
        // Back wall
        {
          color: [0.6, 0.6, 0.6],
          elements: [
            [0, 1, 2],
            [0, 2, 3],
          ]
        },
  
        // Front wall (closing room)
        {
          color: [0.6, 0.6, 0.6],
          elements: [
            [4, 6, 7],
            [4, 7, 5],
          ]
        },
  
        // Left wall
        {
          color: [0.5, 0.5, 0.5],
          elements: [
            [0, 3, 6],
            [0, 6, 4],
          ]
        },
  
        // Right wall
        {
          color: [0.5, 0.5, 0.5],
          elements: [
            [1, 5, 7],
            [1, 7, 2],
          ]
        },
      ]
    }
  }
  