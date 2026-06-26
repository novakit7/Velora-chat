import { HfInference } from "@huggingface/inference";

const model = new HfInference(process.env.HF_TOKEN);

export default model;