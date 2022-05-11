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

// type of emiters
enum CEmiterType {
  ET_AIR_ELEMENTAL = 1,
  ET_SUMMONER_STAFF,
  ET_FIREWORKS,
};

class DECL_DLL CEmittedParticle {
public:
  FLOAT3D ep_vLastPos;
  FLOAT3D ep_vPos;
  FLOAT ep_fLastRot;
  FLOAT ep_fRot;
  FLOAT ep_fRotSpeed;
  FLOAT3D ep_vSpeed; // speed added in each tick
  COLOR ep_colLastColor;
  COLOR ep_colColor;
  FLOAT ep_tmEmitted;
  FLOAT ep_tmLife;
  FLOAT ep_fStretch;

  /* Default constructor. */
  CEmittedParticle(void);
  void Read_t( CTStream &strm);
  void Write_t( CTStream &strm);
};

class DECL_DLL CEmiter {
public:
  enum CEmiterType em_etType;
  BOOL em_bInitialized;
  FLOAT em_tmStart;
  FLOAT em_tmLife;
  FLOAT3D em_vG;
  COLOR em_colGlobal;
  INDEX em_iGlobal;
  CStaticStackArray<CEmittedParticle> em_aepParticles;

  /* Default constructor. */
  CEmiter(void);
  void Initialize(CEntity *pen);
  FLOAT3D GetGravity(CEntity *pen);
  void RenderParticles(void);
  void AnimateParticles(void);
  void AddParticle(FLOAT3D vPos, FLOAT3D vSpeed, FLOAT fRot, FLOAT fRotSpeed, 
    FLOAT tmBirth, FLOAT tmLife, FLOAT fStretch, COLOR colColor);
  void Read_t( CTStream &strm);
  void Write_t( CTStream &strm);
};


// firework emiters
enum CEmiter2Type {
	ET_FIREWORKS00 = 1,
  ET_FIREWORKS01,
	ET_FIREWORKS02,
	ET_FIREWORKS03,
	ET_FIREWORKS04,
	ET_FIREWORKS05,
	ET_FIREWORKS06,
	ET_FIREWORKS07,
	ET_FIREWORKS08,
	ET_FIREWORKS09,
};

class DECL_DLL CEmittedParticle2 {
public:
  FLOAT3D ep_vLastPos;
	FLOAT3D ep_vLastPos1;
	FLOAT3D ep_vLastPos2;
	FLOAT3D ep_vLastPos3;
	FLOAT3D ep_vLastPos4;
	FLOAT3D ep_vLastPos5;
	FLOAT3D ep_vLastPos6;
	FLOAT3D ep_vLastPos7;
	FLOAT3D ep_vLastPos8;
  FLOAT3D ep_vPos;
  FLOAT ep_fLastRot;
  FLOAT ep_fRot;
  FLOAT ep_fRotSpeed;
  FLOAT3D ep_vSpeed; // speed added in each tick
  COLOR ep_colLastColor;
  COLOR ep_colColor;
  FLOAT ep_tmEmitted;
  FLOAT ep_tmLife;
  FLOAT ep_fStretch;
	BOOL  ep_bPrimary;

  /* Default constructor. */
  CEmittedParticle2(void);
  void Read_t( CTStream &strm);
  void Write_t( CTStream &strm);
};

class DECL_DLL CEmiter2 {
public:
  enum CEmiter2Type em_et2Type;
  BOOL em_bInitialized;
  FLOAT em_tmStart;
  FLOAT em_tmLife;
  FLOAT3D em_vG;
  COLOR em_colGlobal;
  INDEX em_iGlobal;
  CStaticStackArray<CEmittedParticle2> em_aepParticles;

  /* Default constructor. */
  CEmiter2(void);
  void Initialize(CEntity *pen);
  FLOAT3D GetGravity(CEntity *pen);
  void RenderParticles(void);
  void AnimateParticles(void);
  void AddParticle(FLOAT3D vPos, FLOAT3D vSpeed, FLOAT fRot, FLOAT fRotSpeed, 
    FLOAT tmBirth, FLOAT tmLife, FLOAT fStretch, COLOR colColor, BOOL bPrimary);
  void Read_t( CTStream &strm);
  void Write_t( CTStream &strm);
};

