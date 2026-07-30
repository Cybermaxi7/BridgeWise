//! CLI entrypoint for `bridgewise-rules`.
//!
//! Usage:
//!   bridgewise-rules <path-to.sol> [<path-to.sol> ...]
//!
//! Runs every implemented rule (currently just B011) against each given
//! Solidity file and prints any violations found. Exits with a non-zero
//! status if any violations were found in any file, or if a file failed to
//! parse.

use bridgewise_rules::b011_address_format;
use std::path::PathBuf;
use std::process::ExitCode;

fn main() -> ExitCode {
    let paths: Vec<PathBuf> = std::env::args().skip(1).map(PathBuf::from).collect();

    if paths.is_empty() {
        eprintln!("usage: bridgewise-rules <path-to.sol> [<path-to.sol> ...]");
        return ExitCode::FAILURE;
    }

    let mut had_findings = false;

    for path in &paths {
        match b011_address_format::check_file(path) {
            Ok(violations) => {
                if violations.is_empty() {
                    println!("{}: OK (B011)", path.display());
                } else {
                    had_findings = true;
                    for v in &violations {
                        let loc = v
                            .line
                            .map(|l| format!(":{l}"))
                            .unwrap_or_default();
                        println!(
                            "{}{}: [B011] {}",
                            path.display(),
                            loc,
                            v.message
                        );
                    }
                }
            }
            Err(e) => {
                had_findings = true;
                eprintln!("{}: error: {e}", path.display());
            }
        }
    }

    if had_findings {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}
