//! `bridgewise-rules` — a standalone static-analysis rule checker for
//! BridgeWise Solidity contracts.
//!
//! This crate is intentionally NOT part of any Cargo workspace, mirroring
//! the standalone-crate convention already used by `contracts/soroban/*` in
//! this repository. It's purely a source-analysis tool over `.sol` files
//! and has nothing to do with the Soroban Rust contracts.
//!
//! Each rule lives in its own module, exposing a testable
//! `check_source(&str) -> Result<Vec<Violation>, String>` entrypoint (and a
//! `check_file` convenience wrapper). See [`b011_address_format`] for the
//! first rule implemented here.

pub mod b011_address_format;
