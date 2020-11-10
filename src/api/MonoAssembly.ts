import { createNativeFunction, MonoImageOpenStatus } from 'core'
import { MonoBase } from './MonoBase'
import { MonoImage } from './MonoImage'

export const mono_assembly_name_new = createNativeFunction('mono_assembly_name_new', 'pointer', ['pointer'])
export const mono_assembly_close = createNativeFunction('mono_assembly_close', 'void', ['pointer'])
//export const mono_assembly_get_object = createNativeFunction('mono_assembly_get_object', 'pointer', ['pointer', 'pointer'])
export const mono_assembly_load = createNativeFunction('mono_assembly_load', 'pointer', ['pointer', 'pointer', 'pointer'])
export const mono_assembly_load_full = createNativeFunction('mono_assembly_load_full', 'pointer', ['pointer', 'pointer', 'pointer', 'bool'])
export const mono_assembly_loaded = createNativeFunction('mono_assembly_loaded', 'pointer', ['pointer'])
export const mono_assembly_load_from = createNativeFunction('mono_assembly_load_from', 'pointer', ['pointer', 'pointer', 'pointer'])
export const mono_assembly_load_from_full = createNativeFunction('mono_assembly_load_from_full', 'pointer', ['pointer', 'pointer', 'pointer', 'bool'])
export const mono_assembly_load_with_partial_name = createNativeFunction('mono_assembly_load_with_partial_name', 'pointer', ['pointer', 'pointer'])

export class MonoAssembly extends MonoBase {
  /**
   * This method releases a reference to the assembly. The assembly is only released when all the outstanding references to it are released.
   * @returns {void}
   */
  close(): void {
    mono_assembly_close(this.$address)
  }

  /**
   * Loads the assembly referenced by aname, if the value of basedir is not NULL, it attempts to load the assembly from that directory before probing the standard locations.
   * @param {string} name - A MonoAssemblyName with the assembly name to load.
   * @param {string} basedir - A directory to look up the assembly at.
   * @returns {MonoAssembly} The assembly referenced by name loaded.
   */
  static load(name: string, basedir: string): MonoAssembly {
    const monoAssemblyName = mono_assembly_name_new(Memory.allocUtf8String(name))
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_assembly_load(monoAssemblyName, Memory.allocUtf8String(basedir), status)
    if (address.isNull()) {
      throw new Error('Failed loading MonoAssembly! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoAssembly.fromAddress(address)
  }

  /**
   * Loads the assembly referenced by aname, if the value of basedir is not NULL, it attempts to load the assembly from that directory before probing the standard locations.
   * If the assembly is being opened in reflection-only mode (refonly set to TRUE) then no assembly binding takes place.
   * @param {string} name - A MonoAssemblyName with the assembly name to load.
   * @param {string} basedir - A directory to look up the assembly at.
   * @param {boolean} refOnly - Whether this assembly is being opened in "reflection-only" mode.
   * @returns {MonoAssembly} The assembly referenced by aname loaded.
   */
  static loadFull(name: string, basedir: string, refOnly: boolean): MonoAssembly {
    const monoAssemblyName = mono_assembly_name_new(Memory.allocUtf8String(name))
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_assembly_load_full(monoAssemblyName, Memory.allocUtf8String(basedir), status, refOnly)
    if (address.isNull()) {
      throw new Error('Failed loading MonoAssembly! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoAssembly.fromAddress(address)
  }

  /**
   * This is used to determine if the specified assembly has been loaded.
   * @param {string} name - An assembly to look for.
   * @returns {MonoAssembly} NULL If the given aname assembly has not been loaded, or a MonoAssembly that matches the MonoAssemblyName specified.
   */
  static loaded(name: string): MonoAssembly {
    const monoAssemblyName = mono_assembly_name_new(Memory.allocUtf8String(name))
    const address = mono_assembly_loaded(monoAssemblyName)
    return MonoAssembly.fromAddress(address)
  }

  /**
   * If the provided image has an assembly reference, it will process the given image as an assembly with the given name.
   * Most likely you want to use the MonoAssembly.loadFull method instead.
   * This is equivalent to calling MonoAssembly.loadFromFull with the refonly parameter set to FALSE.
   * @param {MonoImage} image - Image to load the assembly from.
   * @param {string} name - Assembly name to associate with the assembly.
   * @returns {MonoAssembly}
   */
  static loadFrom(image: MonoImage, name: string): MonoAssembly {
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_assembly_load_from(image.$address, Memory.allocUtf8String(name), status)
    if (address.isNull()) {
      throw new Error('Failed loading MonoAssembly! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoAssembly.fromAddress(address)
  }

  /**
   * If the provided image has an assembly reference, it will process the given image as an assembly with the given name.
   * Most likely you want to use the MonoAssembly.loadFullMethod instead.
   * @param {MonoImage} image - Image to load the assembly from.
   * @param {string} name - Assembly name to associate with the assembly.
   * @param {boolean} refOnly - Whether this assembly is being opened in "reflection-only" mode.
   * @returns {MonoAssembly}
   */
  static loadFromFull(image: MonoImage, name: string, refOnly: boolean): MonoAssembly {
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_assembly_load_from_full(image.$address, Memory.allocUtf8String(name), status, refOnly)
    if (address.isNull()) {
      throw new Error('Failed loading MonoAssembly! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoAssembly.fromAddress(address)
  }

  /**
   * Loads a Mono Assembly from a name. The name is parsed using MonoAssembly.nameParse, so it might contain a qualified type name, version, culture and token.
   * This will load the assembly from the file whose name is derived from the assembly name by appending the .dll extension.
   * The assembly is loaded from either one of the extra Global Assembly Caches specified by the extra GAC paths (specified by the MONO_GAC_PREFIX environment variable) or if that fails from the GAC
   * @param {string} name - An assembly name that is then parsed by MonoAssembly.nameParse
   * @returns {MonoAssembly}
   */
  static loadWithPartialName(name: string): MonoAssembly {
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_assembly_load_with_partial_name(Memory.allocUtf8String(name), status)
    if (address.isNull()) {
      throw new Error('Failed loading MonoAssembly! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoAssembly.fromAddress(address)
  }
}
