from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "SG161222/Realistic_Vision_V5.1_noVAE",
    dtype=torch.float16,
    low_cpu_mem_usage=True
).to("cuda")

pipe.enable_attention_slicing()
pipe.enable_vae_slicing()

pipe.vae.to(dtype=torch.float32)

prompt = input("Enter your prompt: ")

image = pipe(
    prompt,
    height=512,
    width=512,
    num_inference_steps=15,  # 🔥 faster
    guidance_scale=6.0       # 🔥 faster
).images[0]

image.save("output.png")
print("Saved output.png")

