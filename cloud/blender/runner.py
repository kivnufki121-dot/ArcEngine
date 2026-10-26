"""BLACKSITE free GitHub-hosted Blender worker.
Use this only for on-demand development/CI tasks in the project repository.
No secrets are read, and arbitrary script execution is not supported.
"""
import json
import pathlib
import sys

import bpy

ROOT = pathlib.Path.cwd().resolve()
OUTPUT = ROOT / "cloud-output"
OUTPUT.mkdir(parents=True, exist_ok=True)


def valid_source(path):
    if not isinstance(path, str) or not path.endswith(".glb"):
        raise ValueError("The source must be a relative .glb path")
    full = (ROOT / path).resolve()
    if ROOT not in full.parents or not full.is_file():
        raise ValueError("GLB source must exist inside the repository")
    return full


def mesh_report():
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    return {
        "meshes": len(meshes),
        "triangles": sum(len(obj.data.loop_triangles) for obj in meshes),
        "armatures": sum(obj.type == "ARMATURE" for obj in bpy.data.objects),
        "actions": [act.name for act in bpy.data.actions],
        "uv_missing": [obj.name for obj in meshes if not obj.data.uv_layers],
        "materials": len(bpy.data.materials),
    }


def unwrap_missing():
    count = 0
    for obj in [o for o in bpy.data.objects if o.type == "MESH" and not o.data.uv_layers]:
        if not obj.data.polygons:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(island_margin=0.02)
        bpy.ops.object.mode_set(mode="OBJECT")
        count += 1
    return count


def main(job_path):
    job = json.loads(pathlib.Path(job_path).read_text(encoding="utf-8"))
    task = job.get("task")
    if task not in ("smoke_test", "inspect_glb", "prepare_uv"):
        raise ValueError("Unsupported task; expected smoke_test, inspect_glb, or prepare_uv")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    info = {"task": task, "blender_version": bpy.app.version_string, "status": "ok"}
    if task == "smoke_test":
        bpy.ops.mesh.primitive_cube_add()
        bpy.context.object.name = "BLACKSITE_CLOUD_RUNTIME_PROBE"
        bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT / "cloud_ready.blend"))
        info["note"] = "Ready for Blender tasks; no user asset has been modified."
    else:
        source = valid_source(job.get("source"))
        bpy.ops.import_scene.gltf(filepath=str(source))
        info["source"] = str(source.relative_to(ROOT))
        info["before"] = mesh_report()
        if task == "prepare_uv":
            info["uv_created_for_meshes"] = unwrap_missing()
            info["after"] = mesh_report()
            bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT / "character_uv.blend"))
            bpy.ops.export_scene.gltf(
                filepath=str(OUTPUT / "character_uv.glb"),
                export_format="GLB",
                export_apply=False,
            )
    (OUTPUT / "report.json").write_text(json.dumps(info, indent=2, ensure_ascii=False), encoding="utf-8")
    print("BLACKSITE CLOUD RESULT:", json.dumps(info, ensure_ascii=False))


if __name__ == "__main__":
    try:
        sep = sys.argv.index("--")
        job_path = sys.argv[sep + 1]
    except (ValueError, IndexError) as exc:
        raise SystemExit("Expected -- cloud/blender/job.json") from exc
    main(job_path)
