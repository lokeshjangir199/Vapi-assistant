import sys
import os
import torch

# ✅ Fix import path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from cnn import Res8  # Load your actual model

# ✅ Load and export
model = Res8(num_labels=2)  # adjust if your model uses a different number of labels
model.load_state_dict(torch.load("public/models/hey-fire-fox/model-best.pt.bin", map_location="cpu"))
model.eval()

dummy_input = torch.randn(1, 1, 40, 37)  # adjust if your input shape is different
torch.onnx.export(model, dummy_input, "model.onnx",
                  input_names=["input"], output_names=["output"],
                  dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
                  opset_version=11)

print("✅ model.onnx created successfully.")
