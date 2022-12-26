/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */


#include "StdAfx.h"
#include "LCDDrawing.h"
#include <locale.h>

#define USECUSTOMTEXT 0

extern CGame *_pGame;

#if USECUSTOMTEXT
  static CTString _strCustomText = "";
#endif
static CDrawPort *_pdpLoadingHook = NULL;  // drawport for loading hook
extern BOOL _bUserBreakEnabled;
extern BOOL map_bIsFirstEncounter;


#define REFRESHTIME (0.2f)

void RemapLevelNames(INDEX &iLevel)
{
  switch( iLevel) {
  case 10:  iLevel =  1;  break;
  case 11:  iLevel =  2;  break;
  case 12:  iLevel =  3;  break;
  case 13:  iLevel =  4;  break;
  case 14:  iLevel =  5;  break;
  case 15:  iLevel =  6;  break;
  case 21:  iLevel =  7;  break;
  case 22:  iLevel =  8;  break;
  case 23:  iLevel =  9;  break;
  case 24:  iLevel = 10;  break;
  case 31:  iLevel = 11;  break;
  case 32:  iLevel = 12;  break;
  case 33:  iLevel = 13;  break;
  default:  iLevel = -1;	break;
  }
}


static void LoadingHook_t(CProgressHookInfo *pphi)
{
  // if user presses escape
  ULONG ulCheckFlags = 0x8000;
  if (pphi->phi_fCompleted>0) {
    ulCheckFlags |= 0x0001;
  }
  if (_bUserBreakEnabled && (GetAsyncKeyState(VK_ESCAPE)&ulCheckFlags)) {
    // break loading
    throw TRANS("User break!");
  }

#if USECUSTOMTEXT
  // if no custom loading text
  if (_strCustomText=="") {
    // load it
    try {
      _strCustomText.Load_t(CTFILENAME("Data\\LoadingText.txt"));
    } catch (const char *strError) {
      _strCustomText = strError;
    }
  }
#endif

  // measure time since last call
  static CTimerValue tvLast((__int64) 0);
  CTimerValue tvNow = _pTimer->GetHighPrecisionTimer();

  // if not first or final update, and not enough time passed
  if (pphi->phi_fCompleted!=0 && pphi->phi_fCompleted!=1 &&
     (tvNow-tvLast).GetSeconds() < REFRESHTIME) {
    // do nothing
    return;
  }
  tvLast = tvNow;

  // skip if cannot lock drawport
  CDrawPort *pdp = _pdpLoadingHook;                           
  ASSERT(pdp!=NULL);
  CDrawPort dpHook(pdp, TRUE);
  if( !dpHook.Lock()) return;

  // clear screen
  dpHook.Fill(C_BLACK|255);

  // get session properties currently loading
  CSessionProperties *psp = (CSessionProperties *)_pNetwork->GetSessionProperties();
	//BOOL bRandomLevels = psp->sp_bRandomLevels;
	BOOL bFELevel = FALSE;	
	ULONG ulLevelMask = psp->sp_ulLevelsMask;
	INDEX iLevel = -1;

	if (psp->sp_bCooperative) {
		INDEX iLevel = -1;
		INDEX iLevelNext = -1;
		CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();
		CTString strNextLevelName = _pNetwork->ga_fnmNextLevel.FileName();

		//CPrintF("%s, %s\n", strLevelName, strNextLevelName);
  
		// if this is a FE level
		//if (strLevelName.Matches("*01*")
		if ( strLevelName=="01_Hatshepsut" 
			|| strLevelName=="02_SandCanyon"
			|| strLevelName=="03_TombOfRamses"
			|| strLevelName=="04_ValleyOfTheKings"
			|| strLevelName=="05_MoonMountains"
			|| strLevelName=="06_Oasis"
			|| strLevelName=="07_Dunes"
			|| strLevelName=="08_Suburbs"
			|| strLevelName=="09_Sewers"
			|| strLevelName=="10_Metropolis"
			|| strLevelName=="11_AlleyOfSphinxes"
			|| strLevelName=="12_Karnak"
			|| strLevelName=="13_Luxor"
			|| strLevelName=="14_SacredYards"
			|| strLevelName=="15_TheGreatPyramid") {
			bFELevel = TRUE;
			strLevelName.ScanF("%02d_", &iLevel);
			strNextLevelName.ScanF("%02d_", &iLevelNext);
		// if this is a SE level
		} else {
			INDEX u, v;
			u = v = -1;
			strLevelName.ScanF("%01d_%01d_", &u, &v);
			iLevel = u*10+v;
			RemapLevelNames(iLevel);
			u = v = -1;
			strNextLevelName.ScanF("%01d_%01d_", &u, &v);
			iLevelNext = u*10+v;
			RemapLevelNames(iLevelNext);
		}

		//strLevelName.ScanF("%02d_", &iLevel);
		//strNextLevelName.ScanF("%02d_", &iLevelNext);
 
		if (iLevel>0) {
			ulLevelMask|=1<<(iLevel-1);
		}
		if (iLevelNext>0) {
			ulLevelMask|=1<<(iLevelNext-1);
		}

		if (ulLevelMask!=0 && !_pNetwork->IsPlayingDemo()) {
			if (bFELevel) {
				// map hook
				extern void RenderMap_FE( CDrawPort *pdp, ULONG ulLevelMask, CProgressHookInfo *pphi);
				RenderMap_FE(&dpHook, ulLevelMask, pphi);
			} else {
				// map hook
				extern void RenderMap( CDrawPort *pdp, ULONG ulLevelMask, CProgressHookInfo *pphi);
				RenderMap(&dpHook, ulLevelMask, pphi);
			}

			// finish rendering
			dpHook.Unlock();
			dpHook.dp_Raster->ra_pvpViewPort->SwapBuffers();

			// keep current time
			tvLast = _pTimer->GetHighPrecisionTimer();
			return;
		}
	}


  // get sizes
  PIX pixSizeI = dpHook.GetWidth();
  PIX pixSizeJ = dpHook.GetHeight();
  CFontData *pfd = _pfdConsoleFont;
  //PIX pixCharSizeI = pfd->fd_pixCharWidth  + pfd->fd_pixCharSpacing;
  //PIX pixCharSizeJ = pfd->fd_pixCharHeight + pfd->fd_pixLineSpacing;
  PIX pixCharSizeI = pfd->fd_pixCharWidth*0.4f  + pfd->fd_pixCharSpacing*0.4f;
  PIX pixCharSizeJ = pfd->fd_pixCharHeight*0.4f + pfd->fd_pixLineSpacing*0.4f;

  PIX pixBarSizeJ = 17;//*pixSizeJ/480;

  #ifdef FIRST_ENCOUNTER 
  //COLOR colBcg = LerpColor(C_BLACK, SE_COL_GREEN_LIGHT, 0.30f)|0xff;
  //COLOR colBar = LerpColor(C_BLACK, SE_COL_GREEN_LIGHT, 0.45f)|0xff;
  COLOR colBcg = LerpColor(C_BLACK, C_WHITE, 0.30f)|0xff;
  COLOR colBar = LerpColor(C_BLACK, C_WHITE, 0.45f)|0xff;
  COLOR colLines = C_vdGREEN|0xff;
  //COLOR colText = LerpColor(C_BLACK, SE_COL_GREEN_LIGHT, 0.95f)|0xff;
  COLOR colText = LerpColor(C_BLACK, C_WHITE, 0.95f)|0xff;
  #else // Second Encounter
  //COLOR colBcg = LerpColor(C_BLACK, SE_COL_BLUE_LIGHT, 0.30f)|0xff;
  //COLOR colBar = LerpColor(C_BLACK, SE_COL_BLUE_LIGHT, 0.45f)|0xff;
  COLOR colBcg = LerpColor(C_BLACK, C_WHITE, 0.30f)|0xff;
  COLOR colBar = LerpColor(C_BLACK, C_WHITE, 0.45f)|0xff;
  COLOR colLines = colBar; //C_vdGREEN|0xff;
  //COLOR colText = LerpColor(C_BLACK, SE_COL_BLUE_LIGHT, 0.95f)|0xff;
  COLOR colText = LerpColor(C_BLACK, C_WHITE, 0.95f)|0xff;
  #endif
  COLOR colEsc = C_WHITE|0xFF;

  dpHook.Fill(0, pixSizeJ-pixBarSizeJ, pixSizeI, pixBarSizeJ, colBcg);
  dpHook.Fill(0, pixSizeJ-pixBarSizeJ, pixSizeI*pphi->phi_fCompleted, pixBarSizeJ, colBar);
  dpHook.DrawBorder(0, pixSizeJ-pixBarSizeJ, pixSizeI, pixBarSizeJ, colLines);

  dpHook.SetFont( _pfdConsoleFont);
  dpHook.SetTextScaling( 0.9f);
  dpHook.SetTextAspect( 1.0f);
  // print status text
  setlocale(LC_ALL, "");
  CTString strDesc(0, "%s", (const char *) pphi->phi_strDescription);
  strupr((char*)(const char*)strDesc);
  setlocale(LC_ALL, "C");
  CTString strPerc(0, "%3.0f%%", pphi->phi_fCompleted*100);
  dpHook.PutText(strDesc, pixCharSizeI/2, pixSizeJ-pixBarSizeJ+pixCharSizeJ/2, colText);
  dpHook.PutTextR(strPerc, pixSizeI-pixCharSizeI/2, pixSizeJ-pixBarSizeJ+pixCharSizeJ/2, colText);
  if (_bUserBreakEnabled && !_pGame->gm_bFirstLoading) {
    dpHook.PutTextC( TRANS( "PRESS ESC TO ABORT"), pixSizeI/2, pixSizeJ-pixBarSizeJ-10-pixCharSizeJ, colEsc);
  }

  dpHook.Unlock();
  // finish rendering
  dpHook.dp_Raster->ra_pvpViewPort->SwapBuffers();

  // keep current time
  tvLast = _pTimer->GetHighPrecisionTimer();
}

// loading hook functions
void CGame::EnableLoadingHook(CDrawPort *pdpDrawport)
{
  _pdpLoadingHook = pdpDrawport;
  SetProgressHook(LoadingHook_t);
}

void CGame::DisableLoadingHook(void)
{
  SetProgressHook(NULL);
  _pdpLoadingHook = NULL;
}
