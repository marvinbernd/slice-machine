export const valid = {
  __pass: true,
  type: "Embed",
  config: {
    label: "Embed",
    placeholder: "web Embed"
  }
}

export const wrongType = {
  __pass: false,
  type: "Embed2",
  config: {
    label: "Embed",
    placeholder: "web Embed"
  }
}

export const noConfig = {
  __pass: false,
  type: "Embed",
}