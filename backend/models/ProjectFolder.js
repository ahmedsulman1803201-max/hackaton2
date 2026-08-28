const mongoose = require("mongoose");

const projectFolderSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Folder name is required"], trim: true, maxlength: [100, "Folder name is too long"] },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectFolder", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

projectFolderSchema.index({ project: 1, parentFolder: 1, name: 1 }, { unique: true });
projectFolderSchema.methods.toPublicJSON = function () { return { id: this._id, name: this.name, project: this.project, parentFolder: this.parentFolder, createdBy: this.createdBy, createdAt: this.createdAt, updatedAt: this.updatedAt }; };
module.exports = mongoose.model("ProjectFolder", projectFolderSchema);
