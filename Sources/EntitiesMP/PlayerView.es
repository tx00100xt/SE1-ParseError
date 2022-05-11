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

403
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Player.h"
#include "EntitiesMP/PlayerWeapons.h"
extern FLOAT hud_fFOV;
extern INDEX hud_iView;
%}


enum ViewType {
  0 VT_PLAYERDEATH    "",   // player death
  1 VT_PLAYERREBIRTH  "",   // player rebirth (player is spawned)
  2 VT_CAMERA         "",   // camera view
  3 VT_3RDPERSONVIEW  "",   // 3rd person view
};

// input parameter for viewer
event EViewInit {
  CEntityPointer penOwner,        // who owns it
  CEntityPointer penCamera,       // first camera for camera view
  enum ViewType vtView,           // view type
  BOOL bDeathFixed,
};

%{

void CPlayerView_Precache(void) 
{
  CDLLEntityClass *pdec = &CPlayerView_DLLClass;
  pdec->PrecacheModel(MODEL_MARKER);
  pdec->PrecacheTexture(TEXTURE_MARKER);
}

%}

class export CPlayerView : CMovableEntity {
name      "Player View";
thumbnail "";
features "CanBePredictable";

properties:
  1 CEntityPointer m_penOwner,            // class which owns it
  2 INDEX m_iViewType=0,                  // view type
  3 FLOAT m_fDistance = 1.0f,             // current distance
  4 FLOAT3D m_vZLast = FLOAT3D(0,0,0), 
  5 FLOAT3D m_vTargetLast = FLOAT3D(0,0,0), 
  6 BOOL m_bFixed = FALSE,  // fixed view (player falling in abyss)

	10 FLOAT m_fSeriousSpeedWarpTimeUp = 0.0f,
	11 FLOAT m_fSeriousSpeedWarpTimeDown = 0.0f,
	12 FLOAT m_fFOVSeriousSpeed = 0.0f,
	13 BOOL  m_bWarped = FALSE,

components:
  1 model   MODEL_MARKER     "Models\\Editor\\Axis.mdl",
  2 texture TEXTURE_MARKER   "Models\\Editor\\Vector.tex"

functions:
  // add to prediction any entities that this entity depends on
  void AddDependentsToPrediction(void)
  {
    m_penOwner->AddToPrediction();
  }
  void PreMoving() {};
  void DoMoving() {
    en_plLastPlacement = GetPlacement();  // remember old placement for lerping
  };

  void PostMoving() 
  {
    SetCameraPosition();
  }

  CPlacement3D GetLerpedPlacement(void) const
  {
    FLOAT fLerpFactor;
    if (IsPredictor()) {
      fLerpFactor = _pTimer->GetLerpFactor();
    } else {
      fLerpFactor = _pTimer->GetLerpFactor2();
    }
    return LerpPlacementsPrecise(en_plLastPlacement, en_plPlacement, fLerpFactor);
    //return CMovableEntity::GetLerpedPlacement();
  }

  // render particles
  void RenderParticles(void)
  {
    if (Particle_GetViewer()==this) {
      Particles_ViewerLocal(this);
    }
  }

  void SetCameraPosition() 
  {
    // 3rd person view
    FLOAT fDistance = 1.0f;
    CPlacement3D pl = ((CPlayerEntity&) *m_penOwner).en_plViewpoint;
    BOOL bFollowCrossHair = TRUE;
    FLOAT fFOV = Clamp(hud_fFOV, 0.5f, 200.0f);
		/*FLOAT tmNow = _pTimer->CurrentTick();

		if (!m_bWarped) {
			BOOL bDoSpeedWarp = ((CPlayer&)*m_penOwner).m_bDoSeriousSpeedWarp;
			if (bDoSpeedWarp) {
				m_fSeriousSpeedWarpTimeUp = tmNow+0.8f;
				((CPlayer&)*m_penOwner).m_bDoSeriousSpeedWarp = FALSE;
				m_bWarped = TRUE;
			}
		}

		FLOAT fFOVSeriousSpeed = 0.0f;

		if (m_fSeriousSpeedWarpTimeUp > tmNow) {
			m_fFOVSeriousSpeed += 0.25f;
			if (m_fFOVSeriousSpeed >= 30) {
				m_fFOVSeriousSpeed = 30.0f;
			}
			((CPlayer&)*m_penOwner).m_fFOV = m_fFOVSeriousSpeed + 90.0f;
		} 
		
		if (m_bWarped) {
			if (((CPlayer&)*m_penOwner).m_tmSeriousSpeed < tmNow+0.8f) {
				m_fSeriousSpeedWarpTimeDown = tmNow+0.8f;
				m_bWarped = FALSE;
			}
		}

		if (m_fSeriousSpeedWarpTimeDown > tmNow) {
			m_fFOVSeriousSpeed -= 0.25f;
			if (m_fFOVSeriousSpeed <= 0) {
				m_fFOVSeriousSpeed = 0.0f;
			}
			((CPlayer&)*m_penOwner).m_fFOV = m_fFOVSeriousSpeed + 90.0f;
		}

		fFOVSeriousSpeed = m_fFOVSeriousSpeed * 0.055f * fFOV;*/	

    //INDEX iView = hud_iView;// 0;

    if (m_iViewType == VT_3RDPERSONVIEW) {
      // little above player eyes so it can be seen where he is firing
      pl.pl_OrientationAngle(2) -= 12.0f; //10.0f;
      pl.pl_PositionVector(2) += 1.0f;
      fDistance = 4.2f*fFOV;// - fFOVSeriousSpeed;//5.75f;
      bFollowCrossHair = TRUE;
    // death
    } else if (m_iViewType == VT_PLAYERDEATH) {
      fDistance = 3.5f*fFOV;
      bFollowCrossHair = FALSE;
    }

		//CPrintF("fDistance = %.3f\n", fDistance);

    pl.pl_OrientationAngle(3) = 0.0f;

    // transform rotation angle
    pl.RelativeToAbsolute(m_penOwner->GetPlacement());
    // make base placement to back out from
    FLOAT3D vBase;
    EntityInfo *pei= (EntityInfo*) (m_penOwner->GetEntityInfo());
    GetEntityInfoPosition(m_penOwner, pei->vSourceCenter, vBase);

    // create a set of rays to test
    FLOATmatrix3D m;
    MakeRotationMatrixFast(m, pl.pl_OrientationAngle);
    FLOAT3D vRight = m.GetColumn(1);
    FLOAT3D vUp    = m.GetColumn(2);
    FLOAT3D vFront = m.GetColumn(3);

    FLOAT3D vDest[3];
    //vDest[0] = vBase+vFront*fDistance+vUp*1.0f;
    //vDest[1] = vBase+vFront*fDistance-vUp*1.0f;
    vDest[0] = vBase+vFront*fDistance+vRight*1.0f;
    vDest[1] = vBase+vFront*fDistance-vRight*1.0f;
    vDest[2] = vBase+vFront*fDistance;
    //vDest[0] = vBase+vFront*fDistance+vUp*1.0f;
    //vDest[1] = vBase+vFront*fDistance-vUp*1.0f;
    //vDest[2] = vBase+vFront*fDistance+vRight*1.0f;
    //vDest[3] = vBase+vFront*fDistance-vRight*1.0f;
    //vDest[4] = vBase+vFront*fDistance;
    FLOAT fBack = 0;
    // for each ray
    for (INDEX i = 0; i < 3; i++) {
      // cast a ray to find if any brush is hit
      CCastRay crRay( m_penOwner, vBase, vDest[i]);
      crRay.cr_bHitTranslucentPortals = FALSE;
//      crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
      crRay.cr_ttHitModels = CCastRay::TT_NONE;
      GetWorld()->CastRay(crRay);
      // if hit something
      if (crRay.cr_penHit!=NULL) {
        // clamp distance
        fDistance = Min(fDistance, crRay.cr_fHitDistance-0.5f);
        // if hit polygon
        if (crRay.cr_pbpoBrushPolygon!=NULL) {
          // back off
          FLOAT3D vDir = (vDest[i]-vBase).Normalize();
          FLOAT fD = Abs(FLOAT3D(crRay.cr_pbpoBrushPolygon->bpo_pbplPlane->bpl_plAbsolute)%vDir)*0.25f;
          fBack = Max(fBack, fD);
        }
      }
    }

    fDistance = ClampDn(fDistance-fBack, 0.0f);

		// Side view
    if (hud_iView == 1) {
      fDistance = 4.2f*fFOV;
      vBase += vRight*fDistance;
      pl.pl_OrientationAngle(1) += 90.0f;
      bFollowCrossHair = FALSE;
    } 
		// Top view
		else if (hud_iView == 2) {
      fDistance = 4.2f*fFOV;
      vBase += vUp*fDistance;
      pl.pl_OrientationAngle(2) -= 78.0f;
      bFollowCrossHair = FALSE;
    } 
		// Normal
		else {
      vBase += vFront*fDistance;
    }

    m_fDistance = fDistance;

    CPlayerWeapons *ppw = ((CPlayer&) *m_penOwner).GetPlayerWeapons();
    if (bFollowCrossHair) {
      FLOAT3D vTarget = vBase-ppw->m_vRayHit;
      FLOAT fLen = vTarget.Length();
      if (fLen>0.01f) {
        vTarget/=fLen;
      } else {
        vTarget = FLOAT3D(0,1,0);
      }

      FLOAT3D vX;
      FLOAT3D vY = m.GetColumn(2);
      FLOAT3D vZ = vTarget;
      vZ.Normalize();

      if (Abs(vY%vZ)>0.9f) {
        vY = -m.GetColumn(3);
      }

      vX = vY*vZ;
      vX.Normalize();
      vY = vZ*vX;
      vY.Normalize();
      m_vZLast = vZ;

      m(1,1) = vX(1); m(1,2) = vY(1); m(1,3) = vZ(1);
      m(2,1) = vX(2); m(2,2) = vY(2); m(2,3) = vZ(2);
      m(3,1) = vX(3); m(3,2) = vY(3); m(3,3) = vZ(3);
      DecomposeRotationMatrixNoSnap(pl.pl_OrientationAngle, m);
    }

    if (m_bFixed) {
      pl.pl_PositionVector = GetPlacement().pl_PositionVector;
      pl.pl_OrientationAngle = ANGLE3D(0, -90, 0);
      m_fDistance = (pl.pl_PositionVector-m_penOwner->GetPlacement().pl_PositionVector).Length();
      MakeRotationMatrixFast(m, pl.pl_OrientationAngle);
    } else {
      pl.pl_PositionVector = vBase;
    }

    // set camera placement
    SetPlacement_internal(pl, m, TRUE); // TRUE = try to optimize for small movements
  };

  /*void SetCameraPosition() 
  {
    // 3rd person view
    FLOAT fDistance = 1.0f;
    CPlacement3D pl = ((CPlayerEntity&) *m_penOwner).en_plViewpoint;
    
    pl.pl_PositionVector += FLOAT3D(tmp_af[4],tmp_af[5],tmp_af[6]);
    pl.pl_OrientationAngle = ANGLE3D(0.0f, tmp_af[1], 0.0f);
    fDistance = tmp_af[5];

    // transform rotation angle
    pl.RelativeToAbsolute(m_penOwner->GetPlacement());
  
    // create a set ray to test
    FLOATmatrix3D m;
    MakeRotationMatrixFast(m, pl.pl_OrientationAngle);
    FLOAT3D vRight = m.GetColumn(1);
    FLOAT3D vUp    = m.GetColumn(2);
    FLOAT3D vFront = m.GetColumn(3);

    FLOAT3D vDest;
    vDest = vFront*fDistance;

    //FLOAT fBack = 0;
    /*    
    // cast a ray to find if any brush is hit
    CCastRay crRay( m_penOwner, pl.pl_PositionVector, vDest);
    crRay.cr_bHitTranslucentPortals = FALSE;
    crRay.cr_ttHitModels = CCastRay::TT_NONE;
    GetWorld()->CastRay(crRay);
    
    // if hit something
    if (crRay.cr_penHit!=NULL) {
      // clamp distance
      fDistance = Min(fDistance, crRay.cr_fHitDistance-0.5f);      
    }
    //pl.pl_PositionVector += FLOAT3D(0.0f, m_fDistance, 0.0f)*m;
    */
    /*
    m_fDistance = fDistance;
        
    // set camera placement
    SetPlacement_internal(pl, m, TRUE); // TRUE = try to optimize for small movements
  };*/

	//note: m_aCamRotation (as Direction vector) should always point from offset to camera position
	//Get Placement from Vehicle+Offset looking at camera pos(vehicle rotation+camera rotation)
/*CPlacement3D plOffset = CPlacement3D(((CVehicle&)*m_penVehicle).m_vCamOffset, 
		((CVehicle&)*m_penVehicle).m_aCamRotation);
	CPlacement3D plVehicle = m_penVehicle->GetPlacement();
	CPlacement3D plCamera;
	plOffset.RelativeToAbsolute(plVehicle);
	//Cast a ray backwards to make sure we don't hit anything
	CCastRay crRay( m_penVehicle, plOffset);
	crRay.cr_bHitTranslucentPortals = FALSE;
	crRay.cr_ttHitModels = CCastRay::TT_COLLISIONBOX;
	GetWorld()->CastRay(crRay);

	FLOAT fDist = 5.0f;

	// if hit something, zoom closer
	if (crRay.cr_penHit != NULL) {
		fDist = Min(fDist,crRay.cr_fHitDistance);
	}

	//Get Camera Position
	FLOAT3D vDirection;
	AnglesToDirectionVector(plOffset.pl_OrientationAngle, vDirection);
	//Camera is Offset Pos+fDist*Camera Direction Vector
	plCamera = plOffset;
	plCamera.pl_PositionVector += vDirection*fDist;

	//Inverse orientation angle so we look at vehicle
	DirectionVectorToAngles((m_penVehicle->GetPlacement().pl_PositionVector - plCamera.pl_PositionVector).Normalize(),
		plCamera.pl_OrientationAngle);

	FLOATmatrix3D m1;
	MakeRotationMatrixFast(m1, plCamera.pl_OrientationAngle);
	pl = plCamera;
	m = m1;*/

procedures:

  Main(EViewInit eInit) {
    // remember the initial parameters
    ASSERT(eInit.penOwner!=NULL);
    m_penOwner = eInit.penOwner;
    m_iViewType = eInit.vtView;
    m_bFixed = eInit.bDeathFixed;
    ASSERT(IsOfClass(m_penOwner, "Player"));

    // if owner doesn't exist (could be destroyed in initialization)
    if( m_penOwner==NULL) {
      // don't do anything
      Destroy();
      return;
    }

    // init as model
    InitAsEditorModel();
    SetFlags(GetFlags()|ENF_CROSSESLEVELS);
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL|EPF_MOVABLE);
    SetCollisionFlags(ECF_IMMATERIAL);
    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    // add to movers list if needed
    if (m_iViewType == VT_PLAYERDEATH) {
      AddToMovers();
    }

    SendEvent(EStart());
    wait() {
      on (EBegin) : { resume; }
      on (EStart) : {  
        SetCameraPosition();
        en_plLastPlacement = GetPlacement();  // remember old placement for lerping
        m_vTargetLast = ((CPlayer&) *m_penOwner).GetPlayerWeapons()->m_vRayHit;
        resume;
      };
      on (EEnd) : { stop; }
      otherwise() : { resume; }
    }
    // cease to exist
    Destroy();

    return;
  };
};

